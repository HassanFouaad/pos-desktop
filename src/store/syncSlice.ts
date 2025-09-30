import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MetricType, syncMetrics } from "../db/sync/metrics";
import { syncService } from "../db/sync/sync.service";
import { networkStatus } from "../utils/network-status";
import { AppThunk } from "./index";

/**
 * Sync status type
 */
export type SyncStatus = "online" | "offline" | "syncing" | "error";

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
};

/**
 * Determine the sync status based on network and metrics
 */
const determineSyncStatus = (
  isOnline: boolean,
  pendingCount: number,
  delayedCount: number,
  failedCount: number
): SyncStatus => {
  if (!isOnline) return "offline";
  if (failedCount > 0) return "error";
  if (pendingCount > 0 || delayedCount > 0) return "syncing";
  return "online";
};

export const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {
    updateNetworkStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      state.status = determineSyncStatus(
        action.payload,
        state.pendingChanges,
        state.delayedChanges,
        state.failed
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

      state.status = determineSyncStatus(
        state.isOnline,
        pendingChanges,
        delayedChanges,
        failed
      );
    },
  },
});

export const { updateNetworkStatus, updateSyncMetrics } = syncSlice.actions;

// Thunks
export const initSyncMonitoring = (): AppThunk => (dispatch) => {
  // Set up network status listener
  networkStatus.addListener((online) => {
    dispatch(updateNetworkStatus(online));
  });

  // Initial metrics update
  dispatch(refreshSyncMetrics());

  // Set up interval for regular updates
  setInterval(() => {
    dispatch(refreshSyncMetrics());
  }, 5000); // Update every 5 seconds
};

export const refreshSyncMetrics = (): AppThunk => (dispatch) => {
  const pendingChanges = syncMetrics.getGauge(MetricType.PENDING_CHANGES);
  const delayedChanges = syncMetrics.getGauge(MetricType.DELAYED_CHANGES);
  const processed = syncMetrics.getCounter(MetricType.CHANGES_PROCESSED);
  const failed = syncMetrics.getCounter(MetricType.CHANGES_FAILED);
  const retried = syncMetrics.getCounter(MetricType.CHANGES_RETRIED);

  dispatch(
    updateSyncMetrics({
      pendingChanges,
      delayedChanges,
      processed,
      failed,
      retried,
    })
  );
};

export const checkConnectivity = (): AppThunk => async () => {
  await networkStatus.checkConnectivity();
};

export const forceSync = (): AppThunk => async (_, getState) => {
  const { sync } = getState();

  if (sync.isOnline) {
    await syncService.processChanges();
  } else {
    const isConnected = await networkStatus.checkConnectivity();
    if (isConnected) {
      await syncService.processChanges();
    }
  }
};

export const retryFailedChanges = (): AppThunk => async () => {
  await syncService.retryFailedChanges();
};

export default syncSlice.reducer;
