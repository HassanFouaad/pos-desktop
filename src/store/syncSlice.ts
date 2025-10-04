import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { and, count, eq, ne, sql } from "drizzle-orm";
import { drizzleDb } from "../db/drizzle";
import { changes } from "../db/schemas";
import { LogCategory, syncLogger } from "../db/sync/logger";
import { syncService } from "../db/sync/sync.service";
import { networkStatus } from "../utils/network-status";
import { AppThunk } from "./index";

/**
 * Sync status type
 */
export type SyncStatus = "online" | "offline" | "syncing" | "error" | "paused";

/**
 * Sync metrics interface
 */
export interface SyncState {
  pendingChanges: number;
  delayedChanges: number;
  processed: number;
  failed: number;
  retried: number;
  isOnline: boolean;
  status: SyncStatus;
  lastUpdated: number;
  isSyncing: boolean;
  isPaused: boolean;
  offlineSince?: number;
}

const initialState: SyncState = {
  pendingChanges: 0,
  delayedChanges: 0,
  processed: 0,
  failed: 0,
  retried: 0,
  isOnline: networkStatus.isNetworkOnline(),
  status: networkStatus.isNetworkOnline() ? "online" : "offline",
  lastUpdated: Date.now(),
  isSyncing: false,
  isPaused: false,
  offlineSince: undefined,
};

/**
 * Determine the sync status based on network and metrics
 */
const determineSyncStatus = (
  isOnline: boolean,
  pendingCount: number,
  delayedCount: number,
  failedCount: number,
  isSyncing: boolean,
  isPaused: boolean
): SyncStatus => {
  if (!isOnline) return "offline";
  if (isPaused) return "paused";

  if (isSyncing || pendingCount > 0 || delayedCount > 0) return "syncing";
  return "online";
};

export const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {
    updateNetworkStatus: (state, action: PayloadAction<boolean>) => {
      const wasOnline = state.isOnline;
      state.isOnline = action.payload;

      // Track when we went offline
      if (wasOnline && !action.payload) {
        state.offlineSince = Date.now();
      } else if (!wasOnline && action.payload) {
        state.offlineSince = undefined;
      }

      state.status = determineSyncStatus(
        action.payload,
        state.pendingChanges,
        state.delayedChanges,
        state.failed,
        state.isSyncing,
        state.isPaused
      );
    },
    updateSyncMetrics: (
      state,
      action: PayloadAction<{
        pendingChanges: number;
        delayedChanges: number;
        processed: number;
        failed: number;
        retried: number;
      }>
    ) => {
      const { pendingChanges, delayedChanges, processed, failed, retried } =
        action.payload;

      state.pendingChanges = pendingChanges;
      state.delayedChanges = delayedChanges;
      state.processed = processed;
      state.failed = failed;
      state.retried = retried;
      state.lastUpdated = Date.now();

      // If there are no pending or delayed changes, set isSyncing to false
      if (pendingChanges === 0 && delayedChanges === 0) {
        state.isSyncing = false;
      }

      state.status = determineSyncStatus(
        state.isOnline,
        pendingChanges,
        delayedChanges,
        failed,
        state.isSyncing,
        state.isPaused
      );
    },
    setSyncingState: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;

      state.status = determineSyncStatus(
        state.isOnline,
        state.pendingChanges,
        state.delayedChanges,
        state.failed,
        action.payload,
        state.isPaused
      );
    },
    setPausedState: (state, action: PayloadAction<boolean>) => {
      state.isPaused = action.payload;

      state.status = determineSyncStatus(
        state.isOnline,
        state.pendingChanges,
        state.delayedChanges,
        state.failed,
        state.isSyncing,
        action.payload
      );
    },
  },
});

export const {
  updateNetworkStatus,
  updateSyncMetrics,
  setSyncingState,
  setPausedState,
} = syncSlice.actions;

// Thunks
export const initSyncMonitoring = (): AppThunk => (dispatch, getState) => {
  // Set up network status listener
  networkStatus.addListener((online) => {
    dispatch(updateNetworkStatus(online));

    // When network status changes, manage sync service lifecycle
    const state = getState();

    if (online) {
      // Network is back online
      syncLogger.info(
        LogCategory.NETWORK,
        "Network is back online, resuming sync service"
      );

      // If service was paused due to network, resume it
      if (state.sync.isPaused) {
        syncService.resume();
        dispatch(setPausedState(false));
      }
    } else {
      // Network is offline
      syncLogger.info(
        LogCategory.NETWORK,
        "Network is offline, pausing sync service"
      );

      // Pause the sync service
      syncService.pause();
      dispatch(setPausedState(true));
    }
  });

  // Initial metrics update
  dispatch(refreshSyncMetrics());

  // Set up interval for regular updates
  setInterval(() => {
    dispatch(refreshSyncMetrics());
  }, 5000); // Update every 5 seconds

  // Listen for sync events
  syncService.addSyncListener({
    onSyncStart: () => dispatch(setSyncingState(true)),
    onSyncComplete: () => {
      dispatch(setSyncingState(false));
      dispatch(refreshSyncMetrics());
    },
    onSyncPause: () => dispatch(setPausedState(true)),
    onSyncResume: () => {
      dispatch(setPausedState(false));
      dispatch(refreshSyncMetrics());
    },
  });
};

/**
 * Refresh sync metrics directly from the database
 */
export const refreshSyncMetrics = (): AppThunk => async (dispatch) => {
  try {
    const db = drizzleDb.database;

    // Get pending changes count
    const pendingResult = await db
      .select({ count: count() })
      .from(changes)
      .where(eq(changes.status, "pending"))
      .execute();

    // Get delayed changes count
    const delayedResult = await db
      .select({ count: count() })
      .from(changes)
      .where(eq(changes.status, "delayed"))
      .execute();

    // Get processed changes count (success)
    const processedResult = await db
      .select({ count: count() })
      .from(changes)
      .where(eq(changes.status, "success"))
      .execute();

    // Get failed changes count
    const failedResult = await db
      .select({ count: count() })
      .from(changes)
      .where(eq(changes.status, "failed"))
      .execute();

    // Get retried changes count (based on retry_count > 0)
    const retriedResult = await db
      .select({ count: count() })
      .from(changes)
      .where(
        and(ne(changes.retryCount, 0), sql`${changes.retryCount} IS NOT NULL`)
      )
      .execute();

    // Update metrics in state
    dispatch(
      updateSyncMetrics({
        pendingChanges: pendingResult[0]?.count || 0,
        delayedChanges: delayedResult[0]?.count || 0,
        processed: processedResult[0]?.count || 0,
        failed: failedResult[0]?.count || 0,
        retried: retriedResult[0]?.count || 0,
      })
    );
  } catch (error) {
    console.error("Failed to refresh sync metrics:", error);
  }
};

export const checkConnectivity = (): AppThunk => async () => {
  await networkStatus.checkConnectivity();
};

export const forceSync = (): AppThunk => async (dispatch, getState) => {
  const { sync } = getState();

  // Set syncing state
  dispatch(setSyncingState(true));

  try {
    if (sync.isOnline) {
      await syncService.processChanges();
    } else {
      const isConnected = await networkStatus.checkConnectivity();
      if (isConnected) {
        await syncService.processChanges();
      }
    }
  } finally {
    // Refresh metrics after sync attempt
    dispatch(refreshSyncMetrics());
  }
};

export const retryFailedChanges = (): AppThunk => async (dispatch) => {
  dispatch(setSyncingState(true));

  try {
    await syncService.retryFailedChanges();
  } finally {
    dispatch(refreshSyncMetrics());
  }
};

export default syncSlice.reducer;
