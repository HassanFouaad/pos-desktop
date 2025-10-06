import {
  Business as BusinessIcon,
  Devices as DeviceIcon,
  Login as LoginIcon,
  Schedule as TimeIcon,
  LinkOff as UnpairIcon,
} from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InfoCard } from "../../../components/cards/InfoCard";
import { TouchButton } from "../../../components/common/TouchButton";
import { CenteredPageLayout } from "../../../components/layouts/CenteredPageLayout";
import { UnpairConfirmDialog } from "../../../components/layouts/UnpairConfirmDialog";
import { useAppSelector } from "../../../store/hooks";

export const PreLoginPage = () => {
  const [unpairDialogOpen, setUnpairDialogOpen] = useState(false);
  const navigate = useNavigate();
  const pairing = useAppSelector((state) => state.global.pairing);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleUnpairClick = () => {
    setUnpairDialogOpen(true);
  };

  const handleUnpairConfirmed = () => {
    // Navigation will be handled by the dialog after successful unpair
    setUnpairDialogOpen(false);
  };

  const handleUnpairCancelled = () => {
    setUnpairDialogOpen(false);
  };

  return (
    <CenteredPageLayout>
      {/* Header Section with Icon */}
      <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          {pairing.storeName || "Store"}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          <BusinessIcon
            sx={{ fontSize: 20, verticalAlign: "text-bottom", mr: 0.5 }}
          />
          {pairing.tenantName || "Tenant"}
        </Typography>
      </Grid>

      {/* Device Information Section */}
      <Grid size={{ xs: 12 }}>
        <InfoCard backgroundColor="default" bordered={false}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
              >
                <DeviceIcon sx={{ color: "primary.main", fontSize: 24 }} />
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ letterSpacing: "0.1em" }}
                >
                  DEVICE NAME
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {pairing.posDeviceName || "Unknown Device"}
              </Typography>
            </Grid>

            {pairing.lastPairedAt && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1,
                  }}
                >
                  <TimeIcon sx={{ color: "text.secondary", fontSize: 24 }} />
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ letterSpacing: "0.1em" }}
                  >
                    PAIRED ON
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  {dayjs(pairing.lastPairedAt).format("MMM D, YYYY h:mm A")}
                </Typography>
              </Grid>
            )}
          </Grid>
        </InfoCard>
      </Grid>

      {/* Action Buttons */}
      <Grid size={{ xs: 12 }} container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TouchButton
            size="large"
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
            startIcon={<LoginIcon />}
          >
            Login as User
          </TouchButton>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TouchButton
            size="large"
            variant="outlined"
            color="error"
            fullWidth
            onClick={handleUnpairClick}
            startIcon={<UnpairIcon />}
          >
            Unpair Device
          </TouchButton>
        </Grid>
      </Grid>

      {/* Help Text */}
      <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Login to start using the POS system
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Unpairing will disconnect this device and require re-pairing
        </Typography>
      </Grid>

      {/* Unpair Confirmation Dialog */}
      <UnpairConfirmDialog
        open={unpairDialogOpen}
        onConfirm={handleUnpairConfirmed}
        onCancel={handleUnpairCancelled}
      />
    </CenteredPageLayout>
  );
};
