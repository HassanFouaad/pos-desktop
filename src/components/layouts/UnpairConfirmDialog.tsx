import { Warning as WarningIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { unpairPosDevice } from "../../features/auth/api/pos-auth";
import { clearPairingData } from "../../store/globalSlice";
import { useAppDispatch } from "../../store/hooks";
import { TouchButton } from "../common/TouchButton";

export interface UnpairConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const UnpairConfirmDialog = ({
  open,
  onConfirm,
  onCancel,
}: UnpairConfirmDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError("");

      // Call unpair API
      await unpairPosDevice();

      // Clear pairing data from global state
      dispatch(clearPairingData());

      // Call parent handler
      onConfirm();

      // Navigate to pair page
      navigate("/pair");
    } catch (err) {
      console.error("Unpair error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to unpair device. Please try again."
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
    <Dialog
      open={open}
      onClose={loading ? undefined : handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ textAlign: "center" }}>
        <Grid container direction="column" alignItems="center" spacing={2}>
          <Grid>
            <WarningIcon
              sx={{
                fontSize: 80,
                color: "error.main",
              }}
            />
          </Grid>
          <Grid>
            <Typography variant="h4" component="div" fontWeight="bold">
              Unpair Device?
            </Typography>
          </Grid>
        </Grid>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" color="text.secondary" textAlign="center">
              This action will disconnect your device from the POS system.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 2,
                backgroundColor: theme.palette.error.alpha8,
              }}
            >
              <Typography
                variant="body1"
                color="error.main"
                fontWeight="medium"
              >
                ⚠️ Warning:
              </Typography>
              <Typography variant="body2" color="error.dark" sx={{ mt: 1 }}>
                • You will need to re-pair this device to use it again
                <br />
                • Offline functionality will be disabled until re-paired
                <br />• Any unsaved data may be lost
              </Typography>
            </Box>
          </Grid>

          {error && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
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
          color="error"
          fullWidth
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Unpairing..." : "Yes, Unpair"}
        </TouchButton>
      </DialogActions>
    </Dialog>
  );
};
