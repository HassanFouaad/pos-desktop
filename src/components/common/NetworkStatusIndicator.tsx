import {
  Error as ErrorIcon,
  CloudOff as OfflineIcon,
  CheckCircle as OnlineIcon,
  Refresh as RefreshIcon,
  Sync as SyncingIcon,
} from "@mui/icons-material";
import {
  Badge,
  Box,
  Divider,
  Fab,
  Fade,
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
 * Component that displays the current network status with a modern digital look
 * Styled to match the FloatingNavigation component
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

  // Update metrics when component mounts and periodically
  useEffect(() => {
    // Immediately refresh metrics
    dispatch(refreshSyncMetrics());

    // Refresh metrics every 5 seconds
    const intervalId = setInterval(() => {
      dispatch(refreshSyncMetrics());
    }, 5000);

    return () => clearInterval(intervalId);
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

  // Force connectivity check
  const handleForceCheck = () => {
    dispatch(checkConnectivity());
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? "network-status-popover" : undefined;
  const hasPendingChanges = pendingChanges + delayedChanges > 0;

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
          icon: <ErrorIcon />,
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
        <Tooltip title={statusConfig.tooltip} placement="left">
          <Badge
            badgeContent={
              hasPendingChanges ? pendingChanges + delayedChanges : undefined
            }
            color="primary"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.7rem",
                height: "20px",
                minWidth: "20px",
                borderRadius: "10px",
              },
            }}
          >
            <Fab
              size="medium"
              aria-describedby={popoverId}
              onClick={handleClick}
              sx={{
                bgcolor: statusConfig.color,
                color: "#fff",
                boxShadow: theme.shadows[3],
                "&:hover": {
                  bgcolor: statusConfig.color,
                  opacity: 0.9,
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
            >
              {statusConfig.icon}
            </Fab>
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
          PaperProps={{
            elevation: 4,
            sx: {
              borderRadius: 2,
              overflow: "hidden",
              width: 280,
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: statusConfig.color,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {statusConfig.text}
            </Typography>

            <Tooltip title="Check connectivity">
              <Fab
                size="small"
                onClick={handleForceCheck}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.3)",
                  },
                }}
              >
                <RefreshIcon fontSize="small" />
              </Fab>
            </Tooltip>
          </Box>

          {/* Stats */}
          <Box sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Pending Changes
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {pendingChanges + delayedChanges}
                </Typography>
              </Box>

              <Divider />

              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Processed
                  </Typography>
                  <Typography variant="h6">{processed}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Retried
                  </Typography>
                  <Typography variant="h6">{retried}</Typography>
                </Box>
              </Stack>

              {failed > 0 && (
                <Fade in={true}>
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="caption"
                      color="error"
                      fontWeight="bold"
                    >
                      Failed Changes: {failed}
                    </Typography>
                  </Box>
                </Fade>
              )}
            </Stack>
          </Box>
        </Popover>
      )}
    </>
  );
};
