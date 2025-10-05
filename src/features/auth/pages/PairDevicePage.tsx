import {
  Alert,
  CircularProgress,
  Container,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TouchButton } from "../../../components/common/TouchButton";
import { setPairingData } from "../../../store/globalSlice";
import { useAppDispatch } from "../../../store/hooks";
import { pairPosDevice, pairPosSchema } from "../api/pos-auth";

export const PairDevicePage = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Handle OTP input change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setError("");
  };

  // Handle pairing
  const handlePair = async () => {
    try {
      setLoading(true);
      setError("");

      // Validate OTP
      const validation = pairPosSchema.safeParse({ otp });
      if (!validation.success) {
        setError(validation.error.issues[0].message);
        return;
      }

      // Call pairing API
      const response = await pairPosDevice({ otp });

      if (!response.success) {
        setError(
          response.error?.message || "Failed to pair device. Please try again."
        );
        return;
      }

      if (response.data) {
        // Update global state with pairing data
        dispatch(
          setPairingData({
            isPaired: true,
            posDeviceId: response.data.device.id,
            posDeviceName: response.data.device.name,
            storeId: response.data.store.id,
            storeName: response.data.store.name,
            tenantId: response.data.tenant.id,
            tenantName: response.data.tenant.name,
            lastPairedAt: new Date(),
            pairingCheckComplete: true,
          })
        );

        // Navigate to pre-login page
        navigate("/pre-login");
      }
    } catch (err) {
      console.error("Pairing error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6 && !loading) {
      handlePair();
    }
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
            Pair Your Device
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Enter the 6-digit code from your admin panel
          </Typography>
        </Grid>

        {/* OTP Input Section */}
        <Grid size={{ xs: 12 }}>
          <Grid component="form" onSubmit={handleSubmit} container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                autoFocus
                inputProps={{
                  maxLength: 6,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  style: {
                    fontSize: "2.5rem",
                    textAlign: "center",
                    letterSpacing: "0.5em",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "background.default",
                  },
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, textAlign: "center" }}
              >
                {otp.length}/6 digits entered
              </Typography>
            </Grid>

            {/* Error Display */}
            {error && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              </Grid>
            )}

            {/* Pair Button */}
            <Grid size={{ xs: 12 }}>
              <TouchButton
                type="submit"
                size="large"
                variant="contained"
                color="primary"
                fullWidth
                disabled={otp.length !== 6 || loading}
                sx={{
                  py: 3,
                  fontSize: "1.25rem",
                  background: (theme) =>
                    otp.length === 6
                      ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                      : undefined,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Pair Device"
                )}
              </TouchButton>
            </Grid>
          </Grid>
        </Grid>

        {/* Help Text */}
        <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Don't have a pairing code?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Contact your administrator to generate one
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};
