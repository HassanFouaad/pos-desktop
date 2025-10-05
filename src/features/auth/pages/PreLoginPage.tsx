import {
  Login as LoginIcon,
  Store as StoreIcon,
  LinkOff as UnpairIcon,
} from "@mui/icons-material";
import { Container, Grid, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TouchButton } from "../../../components/common/TouchButton";
import { UnpairConfirmDialog } from "../../../components/layout/UnpairConfirmDialog";
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
    <Container
      maxWidth="sm"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Grid container spacing={4}>
        {/* Header Section */}
        <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
          <StoreIcon
            sx={{
              fontSize: 100,
              color: "primary.main",
              mb: 2,
              filter: "drop-shadow(0px 4px 12px rgba(0, 98, 255, 0.3))",
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
            sx={{
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Device Paired
          </Typography>
          <Typography variant="h5" color="text.primary" gutterBottom>
            {pairing.storeName || "Store"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {pairing.tenantName || "Tenant"}
          </Typography>
        </Grid>

        {/* Device Information Section */}
        <Grid
          size={{ xs: 12 }}
          sx={{
            p: 3,
            backgroundColor: "background.default",
            borderRadius: 3,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Device Name
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                {pairing.posDeviceName || "Unknown Device"}
              </Typography>
            </Grid>

            {pairing.lastPairedAt && (
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Paired On
                </Typography>
                <Typography variant="body1">
                  {new Date(pairing.lastPairedAt).toLocaleString()}
                </Typography>
              </Grid>
            )}
          </Grid>
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
              sx={{
                py: 3,
                fontSize: "1.25rem",
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}
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
              sx={{
                py: 3,
                fontSize: "1.1rem",
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                },
              }}
            >
              Unpair Device
            </TouchButton>
          </Grid>
        </Grid>

        {/* Help Text */}
        <Grid size={{ xs: 12 }} sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Login to start using the POS system
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Unpairing will disconnect this device and require re-pairing
          </Typography>
        </Grid>
      </Grid>

      {/* Unpair Confirmation Dialog */}
      <UnpairConfirmDialog
        open={unpairDialogOpen}
        onConfirm={handleUnpairConfirmed}
        onCancel={handleUnpairCancelled}
      />
    </Container>
  );
};
