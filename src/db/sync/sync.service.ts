import { PGliteWithLive } from "@electric-sql/pglite/live";
import { and, asc, eq, sql } from "drizzle-orm";
import { networkStatus } from "../../utils/network-status";
import { database } from "../database";
import { drizzleDb } from "../drizzle";
import { changes } from "../schemas";
import { LogCategory, syncLogger } from "./logger";
import { initSyncPersistence } from "./persistence";
import { SyncPriority, priorityManager } from "./priority";
import { retryStrategy } from "./retry-strategy";
import {
  EntityType,
  SyncChange,
  SyncHandler,
  SyncOperation,
  SyncResult,
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
/**
 * Sync event listener interface
 */
export interface SyncEventListener {
  onSyncStart?: () => void;
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
  onSyncPause?: () => void;
  onSyncResume?: () => void;
}

export class SyncService {
  private static instance: SyncService;
  private db: PGliteWithLive;
  private position = 0;
  private handlers: Record<string, SyncHandler> = {};
  private isRunning = false;
  private isPaused = false;
  private abortController?: AbortController;
  private unsubscribe?: () => Promise<void>;
  private processingQueue = false;
  private hasChangesWhileProcessing = false;
  private syncEventListeners: SyncEventListener[] = [];
  private lastOfflineTimestamp?: number;

  // Public methods for use in SyncContext
  public processChanges: () => Promise<void>;
  public retryFailedChanges: () => Promise<void>;

  private constructor() {
    this.db = database as any as PGliteWithLive;

    // Bind methods to make them available publicly
    this.processChanges = this._processChanges.bind(this);
    this.retryFailedChanges = this._retryFailedChanges.bind(this);

    // Schedule database maintenance for long-term health
    this.scheduleMaintenanceTasks();
  }

  /**
   * Schedule regular maintenance tasks for database health
   * Critical for long-term offline operation (up to 10 years)
   */
  private scheduleMaintenanceTasks(): void {
    // Run maintenance tasks daily
    setInterval(() => {
      this.performDatabaseMaintenance();
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Also run once at startup after a delay
    setTimeout(() => {
      this.performDatabaseMaintenance();
    }, 5 * 60 * 1000); // 5 minutes after startup
  }

  /**
   * Perform database maintenance tasks
   * - Archive old successful changes
   * - Clean up very old changes
   * - Optimize database
   */
  private async performDatabaseMaintenance(): Promise<void> {
    try {
      syncLogger.info(
        LogCategory.MAINTENANCE,
        "Starting database maintenance tasks"
      );

      // Archive successful changes older than 30 days
      await this.archiveOldSuccessfulChanges();

      // Clean up very old failed changes (older than 1 year)
      await this.cleanupVeryOldFailedChanges();

      // Vacuum the database to reclaim space
      await this.vacuumDatabase();

      syncLogger.info(
        LogCategory.MAINTENANCE,
        "Database maintenance tasks completed successfully"
      );
    } catch (error) {
      syncLogger.error(
        LogCategory.MAINTENANCE,
        "Error during database maintenance",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Archive old successful changes to prevent database bloat
   * This moves successful changes older than 30 days to an archive table
   */
  private async archiveOldSuccessfulChanges(): Promise<void> {
    try {
      const drizzle = drizzleDb.database;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Find old successful changes
      const oldChanges = await drizzle
        .select()
        .from(changes)
        .where(
          and(
            eq(changes.status, SyncStatus.SUCCESS),
            sql`${changes.syncedAt} < ${thirtyDaysAgo}`
          )
        )
        .limit(1000) // Process in batches to avoid memory issues
        .execute();

      if (oldChanges.length === 0) {
        syncLogger.debug(
          LogCategory.MAINTENANCE,
          "No old successful changes to archive"
        );
        return;
      }

      // In a production system, we would move these to an archive table
      // For now, we'll just delete them since they've been successfully synced
      const changeIds = oldChanges.map((c) => c.id);

      await drizzle
        .delete(changes)
        .where(sql`id IN (${changeIds.join(",")})`)
        .execute();

      syncLogger.info(
        LogCategory.MAINTENANCE,
        `Archived ${oldChanges.length} old successful changes`,
        { count: oldChanges.length }
      );
    } catch (error) {
      syncLogger.error(
        LogCategory.MAINTENANCE,
        "Error archiving old successful changes",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Clean up very old failed changes
   * For changes that have been in failed state for over a year
   */
  private async cleanupVeryOldFailedChanges(): Promise<void> {
    try {
      const drizzle = drizzleDb.database;
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Find very old failed changes
      const oldFailedChanges = await drizzle
        .select()
        .from(changes)
        .where(
          and(
            eq(changes.status, SyncStatus.FAILED),
            sql`${changes.createdAt} < ${oneYearAgo}`
          )
        )
        .limit(500) // Process in batches
        .execute();

      if (oldFailedChanges.length === 0) {
        syncLogger.debug(
          LogCategory.MAINTENANCE,
          "No very old failed changes to clean up"
        );
        return;
      }

      // In a production system, we might want to:
      // 1. Notify the user about data that couldn't be synced
      // 2. Provide an option to retry or discard
      // 3. Move to a separate archive table for audit purposes

      // For now, we'll just log these for awareness
      syncLogger.warn(
        LogCategory.MAINTENANCE,
        `Found ${oldFailedChanges.length} failed changes older than 1 year`,
        { count: oldFailedChanges.length }
      );

      // We don't automatically delete these as they represent potentially lost data
      // In a real system, this would trigger a notification to the user
    } catch (error) {
      syncLogger.error(
        LogCategory.MAINTENANCE,
        "Error cleaning up very old failed changes",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Vacuum the database to reclaim space and optimize performance
   */
  private async vacuumDatabase(): Promise<void> {
    try {
      // Execute VACUUM on the database
      // Note: This is a placeholder - actual implementation would depend on
      // the specific database engine being used

      const drizzle = drizzleDb.database;

      // For SQLite/PGlite, we would use:
      await drizzle.execute(sql`VACUUM;`);

      syncLogger.info(
        LogCategory.MAINTENANCE,
        "Database vacuum completed successfully"
      );
    } catch (error) {
      syncLogger.error(
        LogCategory.MAINTENANCE,
        "Error vacuuming database",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Network status is now fully managed by NetworkStatusService and Redux
  // This service should not be concerned with network detection

  /**
   * Register a handler for a specific entity type
   */
  /**
   * Add a sync event listener
   */
  public addSyncListener(listener: SyncEventListener): () => void {
    this.syncEventListeners.push(listener);

    // Return function to remove the listener
    return () => {
      const index = this.syncEventListeners.indexOf(listener);
      if (index !== -1) {
        this.syncEventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of a sync event
   */
  private notifySyncListeners(
    event: "start" | "complete" | "error" | "pause" | "resume",
    error?: Error
  ): void {
    this.syncEventListeners.forEach((listener) => {
      try {
        if (event === "start" && listener.onSyncStart) {
          listener.onSyncStart();
        } else if (event === "complete" && listener.onSyncComplete) {
          listener.onSyncComplete();
        } else if (event === "error" && listener.onSyncError && error) {
          listener.onSyncError(error);
        } else if (event === "pause" && listener.onSyncPause) {
          listener.onSyncPause();
        } else if (event === "resume" && listener.onSyncResume) {
          listener.onSyncResume();
        }
      } catch (e) {
        syncLogger.error(
          LogCategory.SYNC,
          "Error notifying sync listener",
          e instanceof Error ? e : new Error(String(e))
        );
      }
    });
  }

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

      // Subscribe to changes
      this.unsubscribe = await this.db.listen(
        "changes",
        this.handleChangesNotification.bind(this)
      );

      // Process any existing changes if network is available
      // This check is now just a safeguard - the Redux store should manage when to start/pause sync
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
    this.isPaused = false;
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

    // Reset processing state
    this.processingQueue = false;
    this.hasChangesWhileProcessing = false;

    syncLogger.info(LogCategory.SYNC, "Sync service stopped successfully");
  }

  /**
   * Pause the sync service when network is unavailable
   * This keeps the service initialized but prevents processing
   */
  public pause(): void {
    if (!this.isRunning || this.isPaused) return;

    this.isPaused = true;
    this.lastOfflineTimestamp = Date.now();

    syncLogger.info(
      LogCategory.SYNC,
      "Pausing sync service due to network unavailability"
    );

    // Cancel any ongoing operations
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = new AbortController();
    }

    // Notify listeners that sync has been paused
    this.notifySyncListeners("pause");
  }

  /**
   * Resume the sync service when network is restored
   * Implements a smart recovery process for resilient sync resumption
   */
  public async resume(): Promise<void> {
    if (!this.isRunning || !this.isPaused) return;

    this.isPaused = false;
    const offlineDuration = this.lastOfflineTimestamp
      ? Math.floor((Date.now() - this.lastOfflineTimestamp) / 1000)
      : 0;

    syncLogger.info(
      LogCategory.SYNC,
      `Resuming sync service after ${offlineDuration} seconds offline`
    );

    // Notify listeners that sync is resuming
    this.notifySyncListeners("resume");

    try {
      // Step 1: Perform a network health check before proceeding
      const isNetworkHealthy = await this.performNetworkHealthCheck();
      if (!isNetworkHealthy) {
        syncLogger.warn(
          LogCategory.SYNC,
          "Network appears unstable, delaying full sync resumption"
        );
        // We'll continue but with a more cautious approach
      }

      // Step 2: Recover any changes that were in progress when we went offline
      await this.recoverInProgressChanges();

      // Step 3: Prioritize changes based on offline duration
      await this.prioritizeChangesForResumption(offlineDuration);

      // Step 4: Process changes with appropriate batching strategy
      if (!this.processingQueue) {
        await this._processChanges();
      }

      syncLogger.info(LogCategory.SYNC, "Sync service resumed successfully");
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        "Error during sync resumption",
        error instanceof Error ? error : new Error(String(error))
      );

      // Even if there's an error, we keep the service in resumed state
      // but we'll retry the processing later
    }
  }

  /**
   * Perform a network health check before full sync resumption
   * This helps avoid aggressive syncing on unstable connections
   */
  private async performNetworkHealthCheck(): Promise<boolean> {
    try {
      // Make a lightweight request to verify network stability
      const isOnline = await networkStatus.checkConnectivity();

      if (!isOnline) {
        return false;
      }

      // Additional checks could be performed here in a production system
      // such as measuring latency, checking for captive portals, etc.

      return true;
    } catch (error) {
      syncLogger.warn(
        LogCategory.NETWORK,
        "Network health check failed",
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * Recover changes that were in progress when the system went offline
   */
  private async recoverInProgressChanges(): Promise<void> {
    try {
      const drizzle = drizzleDb.database;

      // Find changes that might have been interrupted
      const inProgressChanges = await drizzle
        .select()
        .from(changes)
        .where(eq(changes.status, "in_progress"))
        .execute();

      if (inProgressChanges.length === 0) {
        return;
      }

      syncLogger.info(
        LogCategory.SYNC,
        `Recovering ${inProgressChanges.length} interrupted changes`,
        { count: inProgressChanges.length }
      );

      // Reset these changes to pending status
      const changeIds = inProgressChanges.map((c) => c.id);

      await drizzle
        .update(changes)
        .set({
          status: SyncStatus.PENDING,
          retryCount: 0, // Reset retry count
        })
        .where(sql`id IN (${changeIds.join(",")})`)
        .execute();
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        "Error recovering in-progress changes",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Prioritize changes based on offline duration for smart resumption
   * - For short offline periods (<1 hour): normal processing
   * - For medium offline periods (1-24 hours): prioritize critical entities
   * - For long offline periods (>24 hours): use aggressive batching and prioritization
   */
  private async prioritizeChangesForResumption(
    offlineDurationSeconds: number
  ): Promise<void> {
    try {
      // Skip for short offline periods
      if (offlineDurationSeconds < 3600) {
        // Less than 1 hour
        return;
      }

      const drizzle = drizzleDb.database;

      // For medium to long offline periods, prioritize critical entities
      if (offlineDurationSeconds >= 3600) {
        // Get all pending changes
        const pendingChanges = await drizzle
          .select()
          .from(changes)
          .where(eq(changes.status, SyncStatus.PENDING))
          .execute();

        if (pendingChanges.length === 0) {
          return;
        }

        // Group by entity type
        const changesByEntityType: Record<string, any[]> = {};
        pendingChanges.forEach((change) => {
          const entityType = change.entityType;
          if (!changesByEntityType[entityType]) {
            changesByEntityType[entityType] = [];
          }
          changesByEntityType[entityType].push(change);
        });

        // Update priorities based on entity type importance
        for (const [entityType, entityChanges] of Object.entries(
          changesByEntityType
        )) {
          // Determine appropriate priority
          let newPriority = priorityManager.getPriorityForEntity(
            entityType,
            SyncOperation.INSERT
          );

          // For very long offline periods, boost priority of critical entities even more
          if (offlineDurationSeconds > 86400) {
            // More than 24 hours
            if (
              entityType === EntityType.CUSTOMER ||
              entityType === EntityType.ORDER ||
              entityType === EntityType.PAYMENT
            ) {
              newPriority = 1; // Highest priority
            }
          }

          // Update priorities in batches
          const changeIds = entityChanges.map((c) => c.id);

          await drizzle
            .update(changes)
            .set({
              priority: newPriority,
            })
            .where(sql`id IN (${changeIds.join(",")})`)
            .execute();

          syncLogger.info(
            LogCategory.SYNC,
            `Updated priority to ${newPriority} for ${changeIds.length} ${entityType} changes`,
            { entityType, count: changeIds.length, priority: newPriority }
          );
        }
      }
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        "Error prioritizing changes for resumption",
        error instanceof Error ? error : new Error(String(error))
      );
    }
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

    // Don't process changes if paused or network is offline
    if (this.isPaused || !networkStatus.isNetworkOnline()) {
      return;
    }

    this._processChanges();
  }

  /**
   * Process pending changes in the queue
   * @private Internal implementation
   */
  private async _processChanges(): Promise<void> {
    if (!this.isRunning || this.processingQueue || this.isPaused) return;

    // Double-check network status before processing
    if (!networkStatus.isNetworkOnline()) {
      this.pause();
      return;
    }

    this.processingQueue = true;
    this.hasChangesWhileProcessing = false;

    // Notify listeners that sync has started
    this.notifySyncListeners("start");

    // Start timing
    const startTime = performance.now();

    try {
      const { changes } = await this.fetchChanges();

      if (changes.length > 0) {
        syncLogger.info(
          LogCategory.SYNC,
          `Processing ${changes.length} changes`,
          { count: changes.length }
        );

        // Group changes by transaction
        const groupedChanges = this.groupChangesByTransaction(changes);

        for (const [transactionId, txChanges] of Object.entries(
          groupedChanges
        )) {
          const result = await this.processTransactionChanges(
            transactionId,
            txChanges
          );

          if (result === SyncResult.ACCEPTED) {
            await this.markChangesAsProcessed(txChanges.map((c) => c.id));
            this.position = Math.max(
              ...txChanges.map((c) => c.id),
              this.position
            );

            // Successfully processed
          } else if (result === SyncResult.REJECTED) {
            await this.markChangesAsFailed(txChanges.map((c) => c.id));

            // Failed to process
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

      // Notify listeners of error
      this.notifySyncListeners(
        "error",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      this.processingQueue = false;

      // Record the sync duration
      const durationMs = performance.now() - startTime;
      syncLogger.debug(
        LogCategory.SYNC,
        `Sync operation completed in ${Math.round(durationMs)}ms`,
        { durationMs: Math.round(durationMs) }
      );

      // Notify listeners that sync has completed
      this.notifySyncListeners("complete");

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

    // Notify listeners that sync has started
    this.notifySyncListeners("start");

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
        // Notify listeners that sync has completed (even with no changes)
        this.notifySyncListeners("complete");
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
      } else {
        // If not online, notify listeners that sync has completed
        this.notifySyncListeners("complete");
      }
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        "Error retrying failed changes",
        error instanceof Error ? error : new Error(String(error))
      );

      // Notify listeners of error
      this.notifySyncListeners(
        "error",
        error instanceof Error ? error : new Error(String(error))
      );

      // Notify listeners that sync has completed despite error
      this.notifySyncListeners("complete");
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
    // Use the retry strategy service
    return retryStrategy.calculateNextRetryTime(retryCount, {
      baseDelay: 5000, // 5 seconds
      maxDelay: 3600000, // 1 hour
      backoffFactor: 2,
      jitterFactor: 0.25, // 25% jitter
    });
  }

  /**
   * Process all changes for a single transaction
   */
  private async processTransactionChanges(
    _transactionId: string, // Using underscore to indicate unused parameter
    changes: SyncChange[]
  ): Promise<SyncResult> {
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
        return SyncResult.REJECTED;
      }

      try {
        // Process each change with the handler
        for (const change of entityChanges) {
          const result = await handler.syncChange(change);

          if (result !== SyncResult.ACCEPTED) {
            // If retry is requested, schedule retry with backoff
            if (result === SyncResult.RETRY) {
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
        return SyncResult.RETRY;
      }
    }

    return SyncResult.ACCEPTED;
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

      // Change has failed permanently
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

      // Calculate delay for logging
      const delayMs = nextRetryAt.getTime() - Date.now();

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

    // Trigger change processing if online and not paused
    if (
      networkStatus.isNetworkOnline() &&
      this.isRunning &&
      !this.isPaused &&
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
