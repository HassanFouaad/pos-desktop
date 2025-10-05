import { Warning as WarningIcon } from "@mui/icons-material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
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
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
        <Grid container direction="column" alignItems="center" spacing={2}>
          <Grid>
            <WarningIcon
              sx={{
                fontSize: 80,
                color: "error.main",
                filter: "drop-shadow(0px 4px 12px rgba(255, 61, 113, 0.3))",
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

      <DialogContent sx={{ px: 4, py: 3 }}>
        <Typography
          variant="h6"
          color="text.secondary"
          textAlign="center"
          gutterBottom
        >
          This action will disconnect your device from the POS system.
        </Typography>

        <Grid
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: (theme) => `${theme.palette.error.main}15`,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.error.main}`,
          }}
        >
          <Typography variant="body1" color="error.main" fontWeight="medium">
            ⚠️ Warning:
          </Typography>
          <Typography
            variant="body2"
            color="error.dark"
            sx={{ mt: 1, lineHeight: 1.6 }}
          >
            • You will need to re-pair this device to use it again
            <br />
            • Offline functionality will be disabled until re-paired
            <br />• Any unsaved data may be lost
          </Typography>
        </Grid>

        {error && (
          <Grid
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: (theme) => `${theme.palette.error.main}10`,
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, gap: 2 }}>
        <TouchButton
          size="large"
          variant="outlined"
          fullWidth
          onClick={handleCancel}
          disabled={loading}
          sx={{ py: 2, fontSize: "1.1rem", borderWidth: 2 }}
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
          sx={{ py: 2, fontSize: "1.1rem" }}
        >
          {loading ? "Unpairing..." : "Yes, Unpair"}
        </TouchButton>
      </DialogActions>
    </Dialog>
  );
};
