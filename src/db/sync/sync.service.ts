import { PGliteWithLive } from "@electric-sql/pglite/live";
import { eq, sql } from "drizzle-orm";
import { networkStatus } from "../../utils/network-status";
import { database } from "../database";
import { drizzleDb } from "../drizzle";
import { changes } from "../schemas";

// Enums and Types
export enum SyncOperation {
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export enum SyncStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  RETRY = "retry",
}

export interface SyncChange {
  id: number;
  entityType: string;
  entityId: number;
  operation: SyncOperation;
  payload: any;
  createdAt: Date;
  syncedAt: Date | null;
  transactionId: string;
  status: SyncStatus;
}

export interface SyncHandler {
  entityType: string;
  syncChange(change: SyncChange): Promise<"accepted" | "rejected" | "retry">;
}

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

  private constructor() {
    this.db = database as any as PGliteWithLive;
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private setupNetworkListeners() {
    this.networkUnsubscribe = networkStatus.addListener((online) => {
      if (online && this.isRunning) {
        this.processChanges();
      }
    });
  }

  /**
   * Register a handler for a specific entity type
   */
  public registerHandler(handler: SyncHandler): void {
    this.handlers[handler.entityType] = handler;
    console.log(`Registered sync handler for: ${handler.entityType}`);
  }

  /**
   * Start the sync service
   */
  public async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.abortController = new AbortController();

    try {
      console.log("Starting sync service...");
      // Get the latest position from the database
      const lastPosition = await this.getLastPosition();
      this.position = lastPosition || 0;

      // Set up network listeners
      this.setupNetworkListeners();

      // Subscribe to changes
      this.unsubscribe = await this.db.listen(
        "changes",
        this.handleChangesNotification.bind(this)
      );

      // Process any existing changes
      if (networkStatus.isNetworkOnline()) {
        this.processChanges();
      }

      console.log("Sync service started successfully");
    } catch (error) {
      console.error("Failed to start sync service:", error);
      this.isRunning = false;
    }
  }

  /**
   * Stop the sync service
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;
    console.log("Stopping sync service...");

    if (this.abortController) {
      this.abortController.abort();
    }

    if (this.unsubscribe) {
      await this.unsubscribe();
    }

    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
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

    if (networkStatus.isNetworkOnline()) {
      this.processChanges();
    }
  }

  /**
   * Process pending changes in the queue
   */
  private async processChanges(): Promise<void> {
    if (!this.isRunning || this.processingQueue) return;

    this.processingQueue = true;
    this.hasChangesWhileProcessing = false;

    try {
      const { changes, newPosition } = await this.fetchChanges();

      if (changes.length > 0) {
        console.log(`Processing ${changes.length} changes`);
        const groupedChanges = this.groupChangesByTransaction(changes);

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
          } else if (result === "rejected") {
            await this.markChangesAsFailed(txChanges.map((c) => c.id));
          }
        }
      }
    } catch (error) {
      console.error("Error processing changes:", error);
    } finally {
      this.processingQueue = false;

      // If new changes came in while we were processing, process them too
      if (
        this.hasChangesWhileProcessing &&
        this.isRunning &&
        networkStatus.isNetworkOnline()
      ) {
        setTimeout(() => this.processChanges(), 100);
      }
    }
  }

  /**
   * Fetch pending changes from the database
   */
  private async fetchChanges(): Promise<{
    changes: SyncChange[];
    newPosition: number;
  }> {
    const drizzle = drizzleDb.database;
    const pendingChanges = await drizzle
      .select()
      .from(changes)
      .where(eq(changes.status, SyncStatus.PENDING))
      .orderBy(changes.id)
      .limit(50) // Process in batches
      .execute();

    const maxId =
      pendingChanges.length > 0
        ? Math.max(...pendingChanges.map((c) => c.id))
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
   * Process all changes for a single transaction
   */
  private async processTransactionChanges(
    transactionId: string,
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
        console.error(`No handler registered for entity type: ${entityType}`);
        return "rejected";
      }

      try {
        // Process each change with the handler
        for (const change of entityChanges) {
          const result = await handler.syncChange(change);

          if (result !== "accepted") {
            return result; // If any change fails, return early
          }
        }
      } catch (error) {
        console.error(`Error processing ${entityType} changes:`, error);
        return "retry";
      }
    }

    return "accepted";
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
    entityType: string,
    entityId: number,
    operation: SyncOperation,
    payload: any,
    transactionId?: string
  ): Promise<void> {
    const drizzle = drizzleDb.database;
    const txId =
      transactionId ||
      `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

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
      })
      .execute();

    // Trigger change processing if online
    if (
      networkStatus.isNetworkOnline() &&
      this.isRunning &&
      !this.processingQueue
    ) {
      this.processChanges();
    }
  }
}

export const syncService = SyncService.getInstance();
