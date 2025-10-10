/**
 * Pairing Success Step Component
 * Shows confirmation details after successful pairing
 */

import {
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Devices as DeviceIcon,
  Store as StoreIcon,
} from "@mui/icons-material";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import { TouchButton } from "../../../../components/common/TouchButton";
import { PosAuthResponse } from "../../../../types/pos-auth.types";

interface PairingSuccessStepProps {
  pairingData: PosAuthResponse;
  onContinue: () => void;
}

export function PairingSuccessStep({
  pairingData,
  onContinue,
}: PairingSuccessStepProps) {
  const theme = useTheme();
  const { device, store, tenant } = pairingData;

  return (
    <Grid container rowSpacing={1} sx={{ height: 1 }}>
      {/* Success Icon */}
      <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
        <Box
          sx={{
            width: 120,
            height: 120,
            mx: "auto",
            background:
              theme.palette.mode === "light"
                ? `linear-gradient(135deg, ${theme.palette.success.alpha8} 0%, ${theme.palette.success.alpha16} 100%)`
                : `linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%)`,
            borderRadius: "30%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `3px solid ${theme.palette.success.main}`,
            animation: "scaleIn 0.5s ease-out",
            "@keyframes scaleIn": {
              "0%": {
                transform: "scale(0)",
                opacity: 0,
              },
              "50%": {
                transform: "scale(1.1)",
              },
              "100%": {
                transform: "scale(1)",
                opacity: 1,
              },
            },
          }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: 80,
              color: theme.palette.success.main,
            }}
          />
        </Box>
      </Grid>

      {/* Success Title */}
      <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          Pairing Successful!
        </Typography>
      </Grid>

      {/* Pairing Details Card */}
      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            p: 3,
            backgroundColor:
              theme.palette.mode === "light"
                ? theme.palette.background.section
                : theme.palette.background.default,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Grid container rowSpacing={2}>
            {/* Tenant */}
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <BusinessIcon sx={{ color: "primary.main", fontSize: 24 }} />
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ letterSpacing: "0.05em" }}
                >
                  BUSINESS
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>
                {tenant.name}
              </Typography>
            </Grid>

            {/* Store */}
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <StoreIcon sx={{ color: "primary.main", fontSize: 24 }} />
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ letterSpacing: "0.05em" }}
                >
                  STORE
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>
                {store.name}
              </Typography>
              {store.code && (
                <Typography variant="caption" color="text.secondary">
                  Code: {store.code}
                </Typography>
              )}
            </Grid>

            {/* Device */}
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <DeviceIcon sx={{ color: "primary.main", fontSize: 24 }} />
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ letterSpacing: "0.05em" }}
                >
                  DEVICE
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>
                {device.name}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Grid>

      {/* Success Message */}
      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            p: 2,
            backgroundColor:
              theme.palette.mode === "light"
                ? theme.palette.success.alpha8
                : "rgba(34, 197, 94, 0.12)",
            borderRadius: 1,
            border: `1px solid ${
              theme.palette.mode === "light"
                ? theme.palette.success.alpha16
                : "rgba(34, 197, 94, 0.2)"
            }`,
            textAlign: "center",
          }}
        >
          <Typography variant="body1" color="text.primary" fontWeight={500}>
            ✓ Device security configured
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Your device is now securely connected and ready for login
          </Typography>
        </Box>
      </Grid>

      {/* Continue Button */}
      <Grid size={{ xs: 12 }}>
        <TouchButton
          size="large"
          variant="contained"
          color="success"
          fullWidth
          onClick={onContinue}
          sx={{ py: 1.5 }}
        >
          Continue to Login
        </TouchButton>
      </Grid>
    </Grid>
  );
}
