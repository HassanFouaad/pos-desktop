import React, { createContext, useContext } from "react";
import { syncService } from "../db/sync/sync.service";
import { SyncMetricsData, useSyncStatus } from "../hooks/useSyncStatus";
import { networkStatus } from "../utils/network-status";

/**
 * Props for SyncContext Provider
 */
interface SyncContextProviderProps {
  children: React.ReactNode;
  refreshInterval?: number;
}

/**
 * Actions that can be performed on the sync service
 */
interface SyncActions {
  /**
   * Force a connectivity check
   */
  checkConnectivity: () => Promise<boolean>;

  /**
   * Force an immediate sync attempt
   */
  syncNow: () => Promise<void>;

  /**
   * Force a retry of failed changes
   */
  retryFailedChanges: () => Promise<void>;
}

/**
 * Sync Context data including metrics and actions
 */
interface SyncContextData extends SyncMetricsData {
  actions: SyncActions;
}

// Create context with default values
const SyncContext = createContext<SyncContextData>({
  pendingChanges: 0,
  delayedChanges: 0,
  processed: 0,
  failed: 0,
  retried: 0,
  isOnline: true,
  status: "online",
  actions: {
    checkConnectivity: async () => true,
    syncNow: async () => {},
    retryFailedChanges: async () => {},
  },
});

/**
 * Provider component for Sync Context
 */
export const SyncContextProvider: React.FC<SyncContextProviderProps> = ({
  children,
  refreshInterval = 5000,
}) => {
  // Get sync metrics from the hook
  const syncMetrics = useSyncStatus(refreshInterval);

  /**
   * Actions available to control sync behavior
   */
  const actions: SyncActions = {
    // Force a connectivity check
    checkConnectivity: async () => {
      return await networkStatus.checkConnectivity();
    },

    // Force an immediate sync attempt
    syncNow: async () => {
      if (networkStatus.isNetworkOnline()) {
        // This assumes you have a way to force sync - implement based on your syncService
        await syncService.processChanges();
      } else {
        // First check connectivity, then try to sync
        const isConnected = await networkStatus.checkConnectivity();
        if (isConnected) {
          await syncService.processChanges();
        }
      }
    },

    // Reset and retry failed changes
    retryFailedChanges: async () => {
      // This should be implemented based on how your sync service handles failures
      // This is a placeholder for demonstration
      await syncService.retryFailedChanges();
    },
  };

  // Combine metrics and actions
  const contextValue: SyncContextData = {
    ...syncMetrics,
    actions,
  };

  return (
    <SyncContext.Provider value={contextValue}>{children}</SyncContext.Provider>
  );
};

/**
 * Hook to use the sync context
 */
export const useSyncContext = (): SyncContextData => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSyncContext must be used within a SyncContextProvider");
  }
  return context;
};
