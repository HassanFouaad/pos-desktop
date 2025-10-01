import { PGliteWithLive } from "@electric-sql/pglite/live";
import { asc, eq, sql } from "drizzle-orm";
import { networkStatus } from "../../utils/network-status";
import { database } from "../database";
import { drizzleDb } from "../drizzle";
import { changes } from "../schemas";
import { LogCategory, syncLogger } from "./logger";
import { MetricType, syncMetrics } from "./metrics";
import { initSyncPersistence } from "./persistence";
import { SyncPriority, priorityManager } from "./priority";
import {
  EntityType,
  SyncChange,
  SyncHandler,
  SyncOperation,
  SyncStatus,
} from "./types";

/**
 * SyncService - Core service for tracking and synchronizing changes
 *
 * This service manages:
 * - Change tracking for different entity types
 * - Database notification listening
 * - Coordination with entity-specific handlers
 * - Transaction-based grouping of changes
 * - Network status awareness
 */
export class SyncService {
  private static instance: SyncService;
  private db: PGliteWithLive;
  private position = 0;
  private handlers: Record<string, SyncHandler> = {};
  private isRunning = false;
  private abortController?: AbortController;
  private unsubscribe?: () => Promise<void>;
  private processingQueue = false;
  private hasChangesWhileProcessing = false;
  private networkUnsubscribe?: () => void;

  // Public methods for use in SyncContext
  public processChanges: () => Promise<void>;
  public retryFailedChanges: () => Promise<void>;

  private constructor() {
    this.db = database as any as PGliteWithLive;

    // Bind methods to make them available publicly
    this.processChanges = this._processChanges.bind(this);
    this.retryFailedChanges = this._retryFailedChanges.bind(this);
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private setupNetworkListeners() {
    this.networkUnsubscribe = networkStatus.addListener((online) => {
      syncLogger.info(
        LogCategory.NETWORK,
        `Network status changed to ${online ? "online" : "offline"}`,
        { online }
      );

      if (online && this.isRunning) {
        // Give a short delay to let network stabilize before attempting syncs
        setTimeout(() => {
          if (!this.processingQueue) {
            syncLogger.info(
              LogCategory.SYNC,
              "Network is back online - processing pending changes"
            );
            this._processChanges();
          }
        }, 2000);
      }
    });

    // Also register for network errors to potentially trigger retries
    networkStatus.addNetworkErrorListener((error) => {
      syncLogger.warn(
        LogCategory.NETWORK,
        `Network error detected: ${error.code}`,
        { error }
      );

      // Force connectivity check when we detect network errors
      networkStatus.forceConnectivityCheck();
    });
  }

  /**
   * Register a handler for a specific entity type
   */
  public registerHandler(handler: SyncHandler): void {
    this.handlers[handler.entityType] = handler;
    syncLogger.info(
      LogCategory.HANDLER,
      `Registered sync handler for: ${handler.entityType}`,
      { entityType: handler.entityType }
    );
  }

  /**
   * Start the sync service
   */
  public async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.abortController = new AbortController();

    try {
      syncLogger.info(LogCategory.SYNC, "Starting sync service");

      // Initialize persistence module
      const syncPersistence = initSyncPersistence(this);

      // Get the latest position from the database
      const lastPosition = await this.getLastPosition();

      // Check if we have a persisted position that is higher
      const persistedPosition = syncPersistence.getLastSyncPosition();
      this.position = Math.max(lastPosition || 0, persistedPosition || 0);

      // Recover any changes that were in progress during previous session
      await syncPersistence.recoverFromCrash();

      // Set up network listeners
      this.setupNetworkListeners();

      // Subscribe to changes
      this.unsubscribe = await this.db.listen(
        "changes",
        this.handleChangesNotification.bind(this)
      );

      // Process any existing changes
      if (networkStatus.isNetworkOnline()) {
        this._processChanges();
      }

      syncLogger.info(LogCategory.SYNC, "Sync service started successfully", {
        position: this.position,
      });
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        "Failed to start sync service",
        error instanceof Error ? error : new Error(String(error))
      );
      this.isRunning = false;
    }
  }

  /**
   * Stop the sync service and clean up resources
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;
    syncLogger.info(LogCategory.SYNC, "Stopping sync service...");

    // Cancel any ongoing operations
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = undefined;
    }

    // Unsubscribe from database notifications
    if (this.unsubscribe) {
      await this.unsubscribe();
      this.unsubscribe = undefined;
    }

    // Clean up network listeners
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = undefined;
    }

    // Reset processing state
    this.processingQueue = false;
    this.hasChangesWhileProcessing = false;

    syncLogger.info(LogCategory.SYNC, "Sync service stopped successfully");
  }

  private async getLastPosition(): Promise<number> {
    const drizzle = drizzleDb.database;
    const result = await drizzle
      .select({ maxId: sql`MAX(id)` })
      .from(changes)
      .where(eq(changes.status, SyncStatus.SUCCESS))
      .execute();

    return (result[0]?.maxId as number) || 0;
  }

  private async handleChangesNotification(): Promise<void> {
    if (this.processingQueue) {
      this.hasChangesWhileProcessing = true;
      return;
    }

    if (networkStatus.isNetworkOnline()) {
      this._processChanges();
    }
  }

  /**
   * Process pending changes in the queue
   * @private Internal implementation
   */
  private async _processChanges(): Promise<void> {
    if (!this.isRunning || this.processingQueue) return;

    this.processingQueue = true;
    this.hasChangesWhileProcessing = false;

    // Start timing this sync operation
    const stopTimer = syncMetrics.startTimer(MetricType.SYNC_DURATION);

    try {
      const { changes } = await this.fetchChanges();

      if (changes.length > 0) {
        syncLogger.info(
          LogCategory.SYNC,
          `Processing ${changes.length} changes`,
          { count: changes.length }
        );

        // Update gauge for pending changes
        syncMetrics.setGauge(MetricType.PENDING_CHANGES, changes.length);

        // Group changes by transaction
        const groupedChanges = this.groupChangesByTransaction(changes);

        // Increment sync operations counter
        syncMetrics.incrementCounter(MetricType.SYNC_OPERATIONS, 1, {
          batchSize: changes.length,
        });

        for (const [transactionId, txChanges] of Object.entries(
          groupedChanges
        )) {
          const result = await this.processTransactionChanges(
            transactionId,
            txChanges
          );

          if (result === "accepted") {
            await this.markChangesAsProcessed(txChanges.map((c) => c.id));
            this.position = Math.max(
              ...txChanges.map((c) => c.id),
              this.position
            );

            // Increment processed counter
            syncMetrics.incrementCounter(
              MetricType.CHANGES_PROCESSED,
              txChanges.length,
              { status: "success" }
            );
          } else if (result === "rejected") {
            await this.markChangesAsFailed(txChanges.map((c) => c.id));

            // Increment failed counter
            syncMetrics.incrementCounter(
              MetricType.CHANGES_FAILED,
              txChanges.length,
              { status: "rejected" }
            );
          }
          // For 'retry' results, nothing to do here - they are handled by scheduleRetry
        }
      } else {
        syncLogger.debug(LogCategory.SYNC, "No changes to process");
      }
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        "Error processing changes",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      this.processingQueue = false;

      // Record the sync duration
      const durationMs = stopTimer();
      syncLogger.debug(
        LogCategory.SYNC,
        `Sync operation completed in ${durationMs}ms`,
        { durationMs }
      );

      // If new changes came in while we were processing, process them too
      if (
        this.hasChangesWhileProcessing &&
        this.isRunning &&
        networkStatus.isNetworkOnline()
      ) {
        setTimeout(() => this._processChanges(), 100);
      }
    }
  }

  /**
   * Retry failed changes by resetting their status to pending
   */
  private async _retryFailedChanges(): Promise<void> {
    if (!this.isRunning || this.processingQueue) return;

    try {
      const drizzle = drizzleDb.database;

      // Find failed changes
      const failedChanges = await drizzle
        .select()
        .from(changes)
        .where(eq(changes.status, SyncStatus.FAILED))
        .execute();

      if (failedChanges.length === 0) {
        syncLogger.info(LogCategory.SYNC, "No failed changes to retry");
        return;
      }

      // Reset failed changes to pending status
      await drizzle
        .update(changes)
        .set({
          status: SyncStatus.PENDING,
          retryCount: 0, // Reset retry count
        })
        .where(eq(changes.status, SyncStatus.FAILED))
        .execute();

      syncLogger.info(
        LogCategory.SYNC,
        `Reset ${failedChanges.length} failed changes to pending status`,
        { count: failedChanges.length }
      );

      // Process changes immediately if online
      if (networkStatus.isNetworkOnline()) {
        this._processChanges();
      }
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        "Error retrying failed changes",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Fetch pending and ready-to-retry changes from the database
   */
  private async fetchChanges(): Promise<{
    changes: SyncChange[];
    newPosition: number;
  }> {
    const drizzle = drizzleDb.database;
    const now = new Date();

    const pendingChanges = await drizzle
      .select()
      .from(changes)
      .where(
        sql`(${eq(changes.status, SyncStatus.PENDING)}) OR 
            (${eq(changes.status, SyncStatus.DELAYED)} AND 
             (${changes.nextRetryAt} IS NULL OR ${
          changes.nextRetryAt
        } <= ${now}))`
      )
      // Order by priority (lower number = higher priority) and then by ID
      .orderBy(asc(changes.id), asc(changes.priority))
      .limit(50) // Process in batches
      .execute();

    const maxId =
      pendingChanges.length > 0
        ? Math.max(...pendingChanges.map((c: { id: number }) => c.id))
        : this.position;

    return {
      changes: pendingChanges as unknown as SyncChange[],
      newPosition: maxId,
    };
  }

  /**
   * Group changes by transaction ID
   */
  private groupChangesByTransaction(
    changes: SyncChange[]
  ): Record<string, SyncChange[]> {
    return changes.reduce((acc, change) => {
      const txId = change.transactionId || "default";
      if (!acc[txId]) {
        acc[txId] = [];
      }
      acc[txId].push(change);
      return acc;
    }, {} as Record<string, SyncChange[]>);
  }

  /**
   * Calculate next retry time using exponential backoff with jitter
   */
  private calculateNextRetryTime(retryCount: number): Date {
    // Base delay is 5 seconds
    const baseDelayMs = 5000;

    // Max delay is 1 hour
    const maxDelayMs = 60 * 60 * 1000;

    // Calculate exponential backoff: base * 2^retryCount
    let delayMs = baseDelayMs * Math.pow(2, retryCount);

    // Add jitter (±25%) to prevent retry stampedes
    const jitterFactor = 0.25;
    const jitterAmount = delayMs * jitterFactor;
    delayMs = delayMs - jitterAmount + Math.random() * jitterAmount * 2;

    // Cap at max delay
    delayMs = Math.min(delayMs, maxDelayMs);

    // Calculate next retry time
    const nextRetryAt = new Date();
    nextRetryAt.setTime(nextRetryAt.getTime() + delayMs);

    return nextRetryAt;
  }

  /**
   * Process all changes for a single transaction
   */
  private async processTransactionChanges(
    _transactionId: string, // Using underscore to indicate unused parameter
    changes: SyncChange[]
  ): Promise<"accepted" | "rejected" | "retry"> {
    // Group changes by entity type
    const changesByEntityType = changes.reduce((acc, change) => {
      if (!acc[change.entityType]) {
        acc[change.entityType] = [];
      }
      acc[change.entityType].push(change);
      return acc;
    }, {} as Record<string, SyncChange[]>);

    // Process each entity type with its handler
    for (const [entityType, entityChanges] of Object.entries(
      changesByEntityType
    )) {
      const handler = this.handlers[entityType];

      if (!handler) {
        syncLogger.error(
          LogCategory.HANDLER,
          `No handler registered for entity type: ${entityType}`
        );
        return "rejected";
      }

      try {
        // Process each change with the handler
        for (const change of entityChanges) {
          const result = await handler.syncChange(change);

          if (result !== "accepted") {
            // If retry is requested, schedule retry with backoff
            if (result === "retry") {
              await this.scheduleRetry(change);
            }
            return result; // If any change fails, return early
          }
        }
      } catch (error) {
        syncLogger.error(
          LogCategory.HANDLER,
          `Error processing ${entityType} changes`,
          error instanceof Error ? error : new Error(String(error))
        );

        // For unexpected errors, schedule a retry with backoff
        for (const change of entityChanges) {
          await this.scheduleRetry(change);
        }
        return "retry";
      }
    }

    return "accepted";
  }

  /**
   * Schedule a change for retry with exponential backoff
   */
  private async scheduleRetry(change: SyncChange): Promise<void> {
    const drizzle = drizzleDb.database;
    const retryCount = (change.retryCount || 0) + 1;
    const nextRetryAt = this.calculateNextRetryTime(retryCount);

    // Set maximum retry count (e.g., 10 attempts)
    const MAX_RETRIES = 10;

    if (retryCount >= MAX_RETRIES) {
      // If we've exhausted retries, mark as failed
      await drizzle
        .update(changes)
        .set({
          status: SyncStatus.FAILED,
          retryCount,
        })
        .where(eq(changes.id, change.id))
        .execute();

      syncLogger.error(
        LogCategory.CHANGE,
        `Change #${change.id} (${change.entityType}) has exceeded max retries and is marked as failed`,
        new Error(`Max retries (${MAX_RETRIES}) exceeded`),
        {
          entityId: change.id,
          entityType: change.entityType,
          retryCount,
        }
      );

      // Increment failed counter
      syncMetrics.incrementCounter(MetricType.CHANGES_FAILED, 1, {
        entityType: change.entityType,
        reason: "max_retries_exceeded",
      });
    } else {
      // Otherwise, schedule for retry
      await drizzle
        .update(changes)
        .set({
          status: SyncStatus.DELAYED,
          retryCount,
          nextRetryAt,
        })
        .where(eq(changes.id, change.id))
        .execute();

      // Increment retries counter
      syncMetrics.incrementCounter(MetricType.CHANGES_RETRIED, 1, {
        entityType: change.entityType,
        retryCount: retryCount,
      });

      // Record retry delay
      const delayMs = nextRetryAt.getTime() - Date.now();
      syncMetrics.recordTiming(MetricType.RETRY_DELAY, delayMs, {
        entityType: change.entityType,
        retryCount: retryCount,
      });

      // Update gauge for delayed changes
      const delayedCount = syncMetrics.getGauge(MetricType.DELAYED_CHANGES) + 1;
      syncMetrics.setGauge(MetricType.DELAYED_CHANGES, delayedCount);

      syncLogger.info(
        LogCategory.CHANGE,
        `Change #${change.id} (${
          change.entityType
        }) scheduled for retry #${retryCount} at ${nextRetryAt.toISOString()}`,
        {
          changeId: change.id,
          entityType: change.entityType,
          retryCount,
          nextRetryAt: nextRetryAt.toISOString(),
          delayMs,
        }
      );
    }
  }

  /**
   * Mark changes as successfully processed
   */
  private async markChangesAsProcessed(ids: number[]): Promise<void> {
    if (!ids.length) return;

    const drizzle = drizzleDb.database;
    await drizzle
      .update(changes)
      .set({
        status: SyncStatus.SUCCESS,
        syncedAt: new Date(),
      })
      .where(sql`id IN (${ids.join(",")})`)
      .execute();
  }

  /**
   * Mark changes as failed
   */
  private async markChangesAsFailed(ids: number[]): Promise<void> {
    if (!ids.length) return;

    const drizzle = drizzleDb.database;
    await drizzle
      .update(changes)
      .set({
        status: SyncStatus.FAILED,
      })
      .where(sql`id IN (${ids.join(",")})`)
      .execute();
  }

  /**
   * Track a change that needs to be synchronized
   */
  public async trackChange(
    entityType: EntityType | string,
    entityId: number,
    operation: SyncOperation,
    payload: any,
    transactionId?: string,
    priority?: SyncPriority
  ): Promise<void> {
    const drizzle = drizzleDb.database;
    const txId =
      transactionId ||
      `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Determine appropriate priority if not specified
    const changePriority =
      priority ?? priorityManager.getPriorityForEntity(entityType, operation);

    await drizzle
      .insert(changes)
      .values({
        entityType,
        entityId,
        operation,
        payload,
        createdAt: new Date(),
        transactionId: txId,
        status: SyncStatus.PENDING,
        priority: changePriority,
      })
      .execute();

    // Trigger change processing if online
    if (
      networkStatus.isNetworkOnline() &&
      this.isRunning &&
      !this.processingQueue
    ) {
      syncLogger.info(
        LogCategory.SYNC,
        "Processing changes because network is online"
      );
      this._processChanges();
    }
  }
}

export const syncService = SyncService.getInstance();
