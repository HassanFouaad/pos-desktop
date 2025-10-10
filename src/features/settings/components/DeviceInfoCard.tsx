import { Devices as DeviceIcon } from "@mui/icons-material";
import { Box, Divider, Grid, Typography, useTheme } from "@mui/material";
import { InfoCard } from "../../../components/cards";
import { useAppSelector } from "../../../store/hooks";

/**
 * Displays device and pairing information
 * Shows store, POS device name, and pairing details
 */
export const DeviceInfoCard = () => {
  const { store, pos, tenant, pairing } = useAppSelector((state) => ({
    store: state.global.store,
    pos: state.global.pos,
    tenant: state.global.tenant,
    pairing: state.global.pairing,
  }));
  const theme = useTheme();

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | null | undefined;
  }) => (
    <Grid container spacing={1}>
      <Grid size={{ xs: 5 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      </Grid>
      <Grid size={{ xs: 7 }}>
        <Typography variant="body2" color="text.primary" noWrap>
          {value || "N/A"}
        </Typography>
      </Grid>
    </Grid>
  );

  return (
    <InfoCard
      title="Device Information"
      icon={<DeviceIcon sx={{ fontSize: 32 }} />}
      iconColor={theme.palette.primary.main}
      backgroundColor="paper"
    >
      <Grid container spacing={2}>
        {/* Tenant */}
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
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ letterSpacing: "0.05em" }}
                >
                  TENANT
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <InfoRow label="Name" value={tenant?.name} />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Store */}
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
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ letterSpacing: "0.05em" }}
                >
                  STORE
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <InfoRow label="Name" value={store?.name} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <InfoRow label="Code" value={store?.code} />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* POS Device */}
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
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ letterSpacing: "0.05em" }}
                >
                  POS DEVICE
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <InfoRow
                  label="Name"
                  value={pos?.name || pairing.posDeviceName}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <InfoRow
                  label="Paired"
                  value={
                    pairing.lastPairedAt
                      ? new Date(pairing.lastPairedAt).toLocaleString()
                      : "N/A"
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </InfoCard>
  );
};
