import { eq } from "drizzle-orm";
import { getLocalStorage, setLocalStorage } from "../../utils/storage";
import { drizzleDb } from "../drizzle";
import { changes } from "../schemas";
import { LogCategory, syncLogger } from "./logger";
import { SyncService } from "./sync.service";
import { SyncStatus } from "./types";

/**
 * Handles persistence of sync state for recovery after app crashes/restarts
 *
 * This ensures that no sync operations are lost when the app is closed
 * unexpectedly or restarted.
 */
export class SyncPersistence {
  private static instance: SyncPersistence;
  private readonly LOCAL_STORAGE_KEY = "sync_persistence_state";

  /**
   * Key-value pairs with sync state that should be persisted
   */
  private state: {
    lastSyncPosition: number;
    lastSyncTimestamp: number;
    activeChanges: Array<{ id: number; status: string }>;
  } = {
    lastSyncPosition: 0,
    lastSyncTimestamp: 0,
    activeChanges: [],
  };

  private constructor(_syncService: SyncService) {
    this.loadState();
  }

  public static getInstance(syncService?: SyncService): SyncPersistence {
    if (!SyncPersistence.instance) {
      if (!syncService) {
        throw new Error(
          "SyncPersistence requires syncService for initialization"
        );
      }
      SyncPersistence.instance = new SyncPersistence(syncService);
    }
    return SyncPersistence.instance;
  }

  /**
   * Load persisted sync state
   */
  private loadState(): void {
    try {
      const savedState = getLocalStorage<typeof this.state>(
        this.LOCAL_STORAGE_KEY
      );
      if (savedState) {
        this.state = savedState;
        syncLogger.info(LogCategory.SYNC, "Loaded persisted sync state", {
          position: this.state.lastSyncPosition,
          timestamp: new Date(this.state.lastSyncTimestamp).toISOString(),
        });
      }
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        "Error loading persisted sync state",
        error instanceof Error ? error : new Error(String(error))
      );

      // Reset to default state
      this.state = {
        lastSyncPosition: 0,
        lastSyncTimestamp: 0,
        activeChanges: [],
      };
    }
  }

  /**
   * Save current sync state to persistent storage
   */
  public saveState(position?: number): void {
    try {
      if (position !== undefined) {
        this.state.lastSyncPosition = position;
      }
      this.state.lastSyncTimestamp = Date.now();

      setLocalStorage(this.LOCAL_STORAGE_KEY, this.state);
      syncLogger.debug(LogCategory.SYNC, "Saved sync state", {
        position: this.state.lastSyncPosition,
      });
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        "Error saving sync state",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Track active changes that are currently being processed
   */
  public trackActiveChanges(changeIds: number[]): void {
    this.state.activeChanges = changeIds.map((id) => ({
      id,
      status: "processing",
    }));
    this.saveState();
  }

  /**
   * Clear active changes after they've been processed
   */
  public clearActiveChanges(changeIds: number[]): void {
    this.state.activeChanges = this.state.activeChanges.filter(
      (change) => !changeIds.includes(change.id)
    );
    this.saveState();
  }

  /**
   * Get the last persisted sync position
   */
  public getLastSyncPosition(): number {
    return this.state.lastSyncPosition;
  }

  /**
   * Recover from previous state after restart
   * Checks for any active changes that were being processed when the app was closed
   */
  public async recoverFromCrash(): Promise<void> {
    if (this.state.activeChanges.length === 0) {
      syncLogger.info(LogCategory.SYNC, "No active changes to recover");
      return;
    }

    syncLogger.info(
      LogCategory.SYNC,
      `Recovering ${this.state.activeChanges.length} active changes from previous session`,
      { count: this.state.activeChanges.length }
    );

    try {
      const db = drizzleDb.database;
      const activeChangeIds = this.state.activeChanges.map(
        (change) => change.id
      );

      // Reset any in-progress changes to pending state using proper drizzle query
      if (activeChangeIds.length > 0) {
        for (const id of activeChangeIds) {
          await db
            .update(changes)
            .set({
              status: SyncStatus.PENDING,
              retryCount: 0,
            })
            .where(eq(changes.id, id));
        }

        syncLogger.info(
          LogCategory.SYNC,
          `Reset ${activeChangeIds.length} changes to pending status for recovery`,
          { ids: activeChangeIds }
        );
      }

      // Clear active changes
      this.state.activeChanges = [];
      this.saveState();
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        "Error recovering from crash",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}

/**
 * Initialize the persistence service after sync service has been created
 */
export function initSyncPersistence(syncService: SyncService): SyncPersistence {
  return SyncPersistence.getInstance(syncService);
}
