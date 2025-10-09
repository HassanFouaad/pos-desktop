import { Logout as LogoutIcon } from "@mui/icons-material";
import { Alert, Box, Grid, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";
import { useAppDispatch } from "../../store/hooks";
import { ResponsiveDialog } from "../common/ResponsiveDialog";
import { TouchButton } from "../common/TouchButton";

export interface LogoutConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutConfirmDialog = ({
  open,
  onConfirm,
  onCancel,
}: LogoutConfirmDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError("");

      // Dispatch logout action
      await dispatch(logout()).unwrap();

      // Call parent handler
      onConfirm();

      // Navigate to pre-login page
      navigate("/pre-login");
    } catch (err) {
      console.error("Logout error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to logout. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError("");
    onCancel();
  };

  return (
    <ResponsiveDialog
      open={open}
      onClose={loading ? () => {} : handleCancel}
      maxWidth="sm"
      disableBackdropClick={loading}
      title={
        <Grid container direction="column" alignItems="center" spacing={2}>
          <Grid>
            <LogoutIcon
              sx={{
                fontSize: 80,
                color: "warning.main",
              }}
            />
          </Grid>
          <Grid>
            <Typography variant="h4" component="div" fontWeight="bold">
              Logout?
            </Typography>
          </Grid>
        </Grid>
      }
      titleSx={{ textAlign: "center" }}
      actions={
        <>
          <TouchButton
            size="large"
            variant="outlined"
            fullWidth
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </TouchButton>
          <TouchButton
            size="large"
            variant="contained"
            color="warning"
            fullWidth
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Logging out..." : "Yes, Logout"}
          </TouchButton>
        </>
      }
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" color="text.secondary" textAlign="center">
            Are you sure you want to logout?
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.warning.alpha8,
            }}
          >
            <Typography
              variant="body1"
              color="warning.main"
              fontWeight="medium"
            >
              ℹ️ Information:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              • You will need to login again to access the POS system
              <br />
              • Your device will remain paired
              <br />• All unsaved work will be lost
            </Typography>
          </Box>
        </Grid>

        {error && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
      </Grid>
    </ResponsiveDialog>
  );
};
