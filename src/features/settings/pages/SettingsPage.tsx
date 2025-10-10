import { Grid } from "@mui/material";
import { AppVersionCard } from "../components/AppVersionCard";
import { ConnectionStatusCard } from "../components/ConnectionStatusCard";
import { DeviceInfoCard } from "../components/DeviceInfoCard";
import { UnpairDeviceCard } from "../components/UnpairDeviceCard";

/**
 * Settings page - displays device information, connection status, and device management
 * Follows Grid layout pattern with touch-optimized cards
 */
export const SettingsPage = () => {
  return (
    <Grid
      container
      spacing={2}
      sx={{
        height: 1,
        width: 1,
        p: 2,
        overflowY: "auto",
      }}
    >
      {/* Connection Status */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ConnectionStatusCard />
      </Grid>

      {/* Device Information */}
      <Grid size={{ xs: 12, md: 6 }}>
        <DeviceInfoCard />
      </Grid>

      {/* App Version */}
      <Grid size={{ xs: 12, md: 6 }}>
        <AppVersionCard />
      </Grid>

      {/* Unpair Device */}
      <Grid size={{ xs: 12, md: 6 }}>
        <UnpairDeviceCard />
      </Grid>
    </Grid>
  );
};
