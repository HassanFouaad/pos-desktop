import { Info as InfoIcon } from "@mui/icons-material";
import { Box, Divider, Grid, Typography, useTheme } from "@mui/material";
import { InfoCard } from "../../../components/cards";

/**
 * Displays application version and build information
 */
export const AppVersionCard = () => {
  const theme = useTheme();

  // Get version from package.json or environment
  const appVersion = "1.0.0"; // TODO: Get from package.json
  const buildNumber = "1"; // TODO: Get from environment
  const buildDate = new Date().toLocaleDateString(); // TODO: Get from build time

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
      title="App Information"
      icon={<InfoIcon sx={{ fontSize: 32 }} />}
      iconColor={theme.palette.info.main}
      backgroundColor="paper"
    >
      <Grid container spacing={2}>
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
                <InfoRow label="Version" value={appVersion} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <InfoRow label="Build" value={buildNumber} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <InfoRow label="Build Date" value={buildDate} />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            sx={{ display: "block" }}
          >
            © 2025 Modern POS. All rights reserved.
          </Typography>
        </Grid>
      </Grid>
    </InfoCard>
  );
};
