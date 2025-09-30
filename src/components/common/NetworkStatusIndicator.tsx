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
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { checkConnectivity, refreshSyncMetrics } from "../../store/syncSlice";

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
  const dispatch = useAppDispatch();
  const { status, pendingChanges, delayedChanges, processed, failed, retried } =
    useAppSelector((state) => state.sync);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Update metrics when component mounts
  useEffect(() => {
    // Refresh metrics when component mounts
    dispatch(refreshSyncMetrics());
  }, [dispatch]);

  // Handle click to open popover
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (showSyncDetails) {
      dispatch(refreshSyncMetrics());
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
      case "online":
        return {
          icon: <OnlineIcon />,
          color: theme.palette.success.main,
          text: "Online",
          tooltip: "Connected to the network",
        };
      case "offline":
        return {
          icon: <OfflineIcon />,
          color: theme.palette.error.main,
          text: "Offline",
          tooltip: "No network connection",
        };
      case "syncing":
        return {
          icon: <SyncingIcon className="rotate-icon" />,
          color: theme.palette.warning.main,
          text: "Syncing",
          tooltip: `Syncing ${pendingChanges + delayedChanges} changes`,
        };
      case "error":
        return {
          icon: <OfflineIcon />,
          color: theme.palette.error.main,
          text: "Error",
          tooltip: "Sync errors detected",
        };
      default:
        return {
          icon: <OnlineIcon />,
          color: theme.palette.primary.main,
          text: "Unknown",
          tooltip: "Unknown connection status",
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
            badgeContent={
              pendingChanges + delayedChanges > 0
                ? pendingChanges + delayedChanges
                : undefined
            }
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
                <strong>Delayed Changes:</strong> {delayedChanges}
              </Typography>
              <Typography variant="body2">
                <strong>Processed:</strong> {processed}
              </Typography>
              <Typography variant="body2">
                <strong>Retried:</strong> {retried}
              </Typography>
              {failed > 0 && (
                <Typography variant="body2" color="error">
                  <strong>Failed:</strong> {failed}
                </Typography>
              )}

              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>

              <Box sx={{ mt: 1 }}>
                <IconButton
                  size="small"
                  color={status === "online" ? "primary" : "error"}
                  onClick={() => dispatch(checkConnectivity())}
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
