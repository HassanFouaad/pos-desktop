import {
  CloudOff as OfflineIcon,
  CheckCircle as OnlineIcon,
  Sync as SyncingIcon,
} from "@mui/icons-material";
import {
  Badge,
  Box,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { MetricType, syncMetrics } from "../../db/sync/metrics";
import { networkStatus } from "../../utils/network-status";

/**
 * Network status indicator states
 */
export enum NetworkStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  SYNCING = "syncing",
}

/**
 * Props for the NetworkStatusIndicator component
 */
interface NetworkStatusIndicatorProps {
  /**
   * Optional position styling
   */
  position?: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };
  /**
   * Whether to show detailed sync status
   */
  showSyncDetails?: boolean;
}

/**
 * Component that displays the current network status with an indicator
 * and provides sync status details in a popover when clicked
 */
export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  position = { top: 16, right: 16 },
  showSyncDetails = true,
}) => {
  const theme = useTheme();
  const [status, setStatus] = useState<NetworkStatus>(
    networkStatus.isNetworkOnline()
      ? NetworkStatus.ONLINE
      : NetworkStatus.OFFLINE
  );
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [pendingChanges, setPendingChanges] = useState<number>(0);
  const [syncStats, setSyncStats] = useState<{
    processed: number;
    failed: number;
    retried: number;
  }>({
    processed: 0,
    failed: 0,
    retried: 0,
  });

  // Update metrics and sync status periodically
  useEffect(() => {
    // Initial load
    updateMetrics();

    // Set up interval to update metrics
    const intervalId = setInterval(() => {
      updateMetrics();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Listen for network status changes
  useEffect(() => {
    const unsubscribe = networkStatus.addListener((online) => {
      setStatus(online ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE);
    });

    return () => unsubscribe();
  }, []);

  // Get metrics from sync service
  const updateMetrics = () => {
    const pending = syncMetrics.getGauge(MetricType.PENDING_CHANGES);
    const delayed = syncMetrics.getGauge(MetricType.DELAYED_CHANGES);
    const processed = syncMetrics.getCounter(MetricType.CHANGES_PROCESSED);
    const failed = syncMetrics.getCounter(MetricType.CHANGES_FAILED);
    const retried = syncMetrics.getCounter(MetricType.CHANGES_RETRIED);

    const totalPending = pending + delayed;

    // Update sync status based on pending changes
    if (totalPending > 0 && networkStatus.isNetworkOnline()) {
      setStatus(NetworkStatus.SYNCING);
    } else if (networkStatus.isNetworkOnline()) {
      setStatus(NetworkStatus.ONLINE);
    } else {
      setStatus(NetworkStatus.OFFLINE);
    }

    // Update state with the latest metrics
    setPendingChanges(totalPending);
    setSyncStats({
      processed,
      failed,
      retried,
    });
  };

  // Handle click to open popover
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (showSyncDetails) {
      updateMetrics();
      setAnchorEl(event.currentTarget);
    }
  };

  // Handle close of popover
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? "network-status-popover" : undefined;

  // Determine icon and color based on status
  const getStatusConfig = () => {
    switch (status) {
      case NetworkStatus.ONLINE:
        return {
          icon: <OnlineIcon />,
          color: theme.palette.success.main,
          text: "Online",
          tooltip: "Connected to the network",
        };
      case NetworkStatus.OFFLINE:
        return {
          icon: <OfflineIcon />,
          color: theme.palette.error.main,
          text: "Offline",
          tooltip: "No network connection",
        };
      case NetworkStatus.SYNCING:
        return {
          icon: <SyncingIcon className="rotate-icon" />,
          color: theme.palette.warning.main,
          text: "Syncing",
          tooltip: `Syncing ${pendingChanges} changes`,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          ...position,
          zIndex: theme.zIndex.appBar + 1,
        }}
      >
        <Tooltip title={statusConfig.tooltip}>
          <Badge
            badgeContent={pendingChanges > 0 ? pendingChanges : undefined}
            color="primary"
          >
            <IconButton
              onClick={handleClick}
              sx={{
                color: statusConfig.color,
                bgcolor: "background.paper",
                boxShadow: 1,
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.1)",
                },
                "& .rotate-icon": {
                  animation: "spin 2s linear infinite",
                },
                "@keyframes spin": {
                  "0%": {
                    transform: "rotate(0deg)",
                  },
                  "100%": {
                    transform: "rotate(360deg)",
                  },
                },
              }}
              size="large"
            >
              {statusConfig.icon}
            </IconButton>
          </Badge>
        </Tooltip>
      </Box>

      {showSyncDetails && (
        <Popover
          id={popoverId}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="h6" color={statusConfig.color} gutterBottom>
              {statusConfig.text}
            </Typography>

            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Pending Changes:</strong> {pendingChanges}
              </Typography>
              <Typography variant="body2">
                <strong>Processed:</strong> {syncStats.processed}
              </Typography>
              <Typography variant="body2">
                <strong>Retried:</strong> {syncStats.retried}
              </Typography>
              {syncStats.failed > 0 && (
                <Typography variant="body2" color="error">
                  <strong>Failed:</strong> {syncStats.failed}
                </Typography>
              )}

              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>

              <Box sx={{ mt: 1 }}>
                <IconButton
                  size="small"
                  color={networkStatus.isNetworkOnline() ? "primary" : "error"}
                  onClick={() => networkStatus.forceConnectivityCheck()}
                >
                  <SyncingIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" sx={{ ml: 1 }}>
                  Check connectivity
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Popover>
      )}
    </>
  );
};
