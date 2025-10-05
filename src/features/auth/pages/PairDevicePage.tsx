import { Alert, Box, Container, Paper, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TouchButton } from "../../../components/common/TouchButton";
import { TouchKeyboard } from "../../../components/common/TouchKeyboard";
import { setPairingData } from "../../../store/globalSlice";
import { useAppDispatch } from "../../../store/hooks";
import { pairPosDevice, pairPosSchema } from "../api/pos-auth";

export const PairDevicePage = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Handle OTP input from keyboard
  const handleKeyPress = (value: string) => {
    // Only allow digits and limit to 6 characters
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setOtp(digitsOnly);
    setError(""); // Clear error on input
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

        // Navigate to pre-login page (or login page)
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

  // Handle enter key from keyboard
  const handleEnter = () => {
    if (otp.length === 6 && !loading) {
      handlePair();
    }
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
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Pair Your Device
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Enter the 6-digit pairing code from your admin panel
        </Typography>
      </Box>

      {/* OTP Display */}
      <Paper
        elevation={3}
        sx={{
          mb: 3,
          p: 4,
          textAlign: "center",
          backgroundColor: "background.default",
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h2"
          component="div"
          fontFamily="monospace"
          letterSpacing={8}
          sx={{
            minHeight: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: { xs: "3rem", sm: "4rem" },
          }}
        >
          {otp || "------"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {otp.length}/6 digits entered
        </Typography>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, fontSize: "1.1rem" }}>
          {error}
        </Alert>
      )}

      {/* Numeric Keyboard */}
      <Box sx={{ mb: 3 }}>
        <NumericKeyboard
          value={otp}
          onValueChange={handleKeyPress}
          onEnter={handleEnter}
        />
      </Box>

      {/* Pair Button */}
      <TouchButton
        size="large"
        variant="contained"
        color="primary"
        fullWidth
        disabled={otp.length !== 6 || loading}
        onClick={handlePair}
        sx={{
          py: 3,
          fontSize: "1.5rem",
        }}
      >
        {loading ? "Pairing..." : "Pair Device"}
      </TouchButton>
    </Container>
  );
};

/**
 * Numeric keyboard component specifically for OTP entry
 */
interface NumericKeyboardProps {
  value: string;
  onValueChange: (value: string) => void;
  onEnter: () => void;
}

const NumericKeyboard = ({
  value,
  onValueChange,
  onEnter,
}: NumericKeyboardProps) => {
  const [internalValue, setInternalValue] = useState(value);

  return (
    <TouchKeyboard
      initialValue={internalValue}
      onKeyPress={(newValue) => {
        // Filter to only digits and limit to 6
        const digitsOnly = newValue.replace(/\D/g, "").slice(0, 6);
        setInternalValue(digitsOnly);
        onValueChange(digitsOnly);
      }}
      onEnter={onEnter}
      mode="text"
    />
  );
};
