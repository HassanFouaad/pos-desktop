import {
  Login as LoginIcon,
  Store as StoreIcon,
  LinkOff as UnpairIcon,
} from "@mui/icons-material";
import { Box, Container, Paper, Typography } from "@mui/material";
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
      maxWidth="md"
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <StoreIcon sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Device Paired
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {pairing.storeName || "Store"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {pairing.tenantName || "Tenant"}
        </Typography>
      </Box>

      {/* Device Information Card */}
      <Paper
        elevation={2}
        sx={{
          mb: 4,
          p: 3,
          backgroundColor: "background.default",
          borderRadius: 3,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Device Name
        </Typography>
        <Typography variant="h6" gutterBottom>
          {pairing.posDeviceName || "Unknown Device"}
        </Typography>

        {pairing.lastPairedAt && (
          <>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Paired On
            </Typography>
            <Typography variant="body1">
              {new Date(pairing.lastPairedAt).toLocaleString()}
            </Typography>
          </>
        )}
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TouchButton
          size="large"
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
          startIcon={<LoginIcon />}
          sx={{
            py: 3,
            fontSize: "1.5rem",
          }}
        >
          Login as User
        </TouchButton>

        <TouchButton
          size="large"
          variant="outlined"
          color="error"
          fullWidth
          onClick={handleUnpairClick}
          startIcon={<UnpairIcon />}
          sx={{
            py: 3,
            fontSize: "1.25rem",
          }}
        >
          Unpair Device
        </TouchButton>
      </Box>

      {/* Help Text */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Login to start using the POS system
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Unpairing will disconnect this device and require re-pairing
        </Typography>
      </Box>

      {/* Unpair Confirmation Dialog */}
      <UnpairConfirmDialog
        open={unpairDialogOpen}
        onConfirm={handleUnpairConfirmed}
        onCancel={handleUnpairCancelled}
      />
    </Container>
  );
};
