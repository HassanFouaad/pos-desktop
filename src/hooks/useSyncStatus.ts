import { useEffect, useState } from "react";
import { MetricType, syncMetrics } from "../db/sync/metrics";
import { networkStatus } from "../utils/network-status";

/**
 * Sync status type
 */
export type SyncStatus = "online" | "offline" | "syncing" | "error";

/**
 * Sync metrics interface
 */
export interface SyncMetricsData {
  pendingChanges: number;
  delayedChanges: number;
  processed: number;
  failed: number;
  retried: number;
  isOnline: boolean;
  status: SyncStatus;
}

/**
 * Hook to provide sync status and metrics data
 * @param refreshInterval - Interval in milliseconds to refresh data
 */
export function useSyncStatus(refreshInterval: number = 5000): SyncMetricsData {
  const [metrics, setMetrics] = useState<SyncMetricsData>({
    pendingChanges: 0,
    delayedChanges: 0,
    processed: 0,
    failed: 0,
    retried: 0,
    isOnline: networkStatus.isNetworkOnline(),
    status: networkStatus.isNetworkOnline() ? "online" : "offline",
  });

  useEffect(() => {
    // Update metrics immediately
    updateMetrics();

    // Set up interval for regular updates
    const intervalId = setInterval(() => {
      updateMetrics();
    }, refreshInterval);

    // Listen for network status changes
    const unsubscribe = networkStatus.addListener((online) => {
      setMetrics((prev) => ({
        ...prev,
        isOnline: online,
        status: determineSyncStatus(
          online,
          prev.pendingChanges,
          prev.delayedChanges,
          prev.failed
        ),
      }));
    });

    // Clean up
    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [refreshInterval]);

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

  /**
   * Update metrics from syncMetrics service
   */
  const updateMetrics = () => {
    const pendingChanges = syncMetrics.getGauge(MetricType.PENDING_CHANGES);
    const delayedChanges = syncMetrics.getGauge(MetricType.DELAYED_CHANGES);
    const processed = syncMetrics.getCounter(MetricType.CHANGES_PROCESSED);
    const failed = syncMetrics.getCounter(MetricType.CHANGES_FAILED);
    const retried = syncMetrics.getCounter(MetricType.CHANGES_RETRIED);
    const isOnline = networkStatus.isNetworkOnline();

    const status = determineSyncStatus(
      isOnline,
      pendingChanges,
      delayedChanges,
      failed
    );

    setMetrics({
      pendingChanges,
      delayedChanges,
      processed,
      failed,
      retried,
      isOnline,
      status,
    });
  };

  return metrics;
}
