import {
  CloudOff as OfflineIcon,
  CheckCircle as OnlineIcon,
  CloudSync as SyncingIcon,
} from "@mui/icons-material";
import { Box, Chip, Grid, Typography, useTheme } from "@mui/material";
import { InfoCard } from "../../../components/cards";
import { useAppSelector } from "../../../store/hooks";

/**
 * Displays the current connection status of the device
 * Shows online, offline, or syncing status with appropriate icons
 */
export const ConnectionStatusCard = () => {
  const connectionStatus = useAppSelector(
    (state) => state.global.connectionStatus
  );
  const theme = useTheme();

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case "online":
        return {
          icon: <OnlineIcon sx={{ fontSize: 32 }} />,
          color: theme.palette.success.main,
          label: "Online",
          description: "Connected to server",
        };
      case "syncing":
        return {
          icon: <SyncingIcon sx={{ fontSize: 32 }} />,
          color: theme.palette.info.main,
          label: "Syncing",
          description: "Synchronizing data...",
        };
      case "offline":
      default:
        return {
          icon: <OfflineIcon sx={{ fontSize: 32 }} />,
          color: theme.palette.error.main,
          label: "Offline",
          description: "No connection to server",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <InfoCard
      title="Connection Status"
      icon={statusConfig.icon}
      iconColor={statusConfig.color}
      backgroundColor="paper"
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Chip
              label={statusConfig.label}
              sx={{
                backgroundColor:
                  theme.palette.mode === "light"
                    ? `${statusConfig.color}22`
                    : `${statusConfig.color}33`,
                color: statusConfig.color,
                fontWeight: 600,
                fontSize: "1rem",
                height: 40,
                borderRadius: theme.customShape.borderRadiusMedium,
                border: `2px solid ${statusConfig.color}`,
              }}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ fontWeight: 500 }}
          >
            {statusConfig.description}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              p: 2,
              backgroundColor:
                theme.palette.mode === "light"
                  ? theme.palette.background.section
                  : theme.palette.background.default,
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {connectionStatus === "online"
                ? "✓ All features available"
                : connectionStatus === "syncing"
                ? "⟳ Data is being synchronized"
                : "⚠ Working in offline mode. Some features may be limited."}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </InfoCard>
  );
};
