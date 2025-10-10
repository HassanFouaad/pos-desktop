import { CircularProgress, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TouchButton } from "../../../components/common/TouchButton";
import { CenteredPageLayout } from "../../../components/layouts/CenteredPageLayout";
import { FormSection } from "../../../components/layouts/FormSection";
import { setPairingData, setStore } from "../../../store/globalSlice";
import { useAppDispatch } from "../../../store/hooks";
import { PosAuthResponse } from "../../../types/pos-auth.types";
import { StoreDto } from "../../stores/types";
import { pairPosDevice, pairPosSchema } from "../api/pos-auth";
import {
  PairingErrorDisplay,
  PairingStep,
  PairingStepIndicator,
  PairingSuccessStep,
  PairingVerifyingStep,
} from "../components/pairing";
import { getPairingErrorDetails } from "../utils/pairing-errors";

export const PairDevicePage = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<Error | string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<PairingStep>("input");
  const [pairingData, setPairingDataState] = useState<PosAuthResponse | null>(
    null
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Handle OTP input change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setError(null);
  };

  // Handle pairing
  const handlePair = async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentStep("verifying");

      // Validate OTP
      const validation = pairPosSchema.safeParse({ otp });
      if (!validation.success) {
        setError(validation.error.issues[0].message);
        setCurrentStep("input");
        setLoading(false);
        return;
      }

      // Call pairing API
      const response = await pairPosDevice({ otp });

      if (!response.success) {
        const errorMessage =
          response.error?.message || "Failed to pair device. Please try again.";
        setError(errorMessage);
        setCurrentStep("input");
        setLoading(false);
        return;
      }

      if (response.data) {
        // Store pairing data for success display
        setPairingDataState(response.data);

        // Update global state with pairing data
        dispatch(
          setPairingData({
            isPaired: true,
            posDeviceName: response.data.device.name,
            storeId: response.data.store.id,
            storeName: response.data.store.name,
            storeCode: response.data.store.code,
            tenantId: response.data.tenant.id,
            tenantName: response.data.tenant.name,
            lastPairedAt: new Date().toISOString(),
            pairingCheckComplete: true,
            isLoading: false,
          })
        );

        if (response.data.store)
          dispatch(setStore(response.data.store as StoreDto));

        // Show success step
        setCurrentStep("success");
        setLoading(false);
      }
    } catch (err) {
      console.error("Pairing error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      setCurrentStep("input");
      setLoading(false);
    }
  };

  // Handle continue after success
  const handleContinue = () => {
    navigate("/pre-login");
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length === 6 && !loading) {
      handlePair();
    }
  };

  // Get error details for enhanced display
  const errorDetails = error ? getPairingErrorDetails(error) : null;

  return (
    <CenteredPageLayout>
      <Grid container gap={1} sx={{ height: 1 }} size={{ xs: 12 }}>
        {/* Step Indicator - Show on all steps */}
        <Grid size={{ xs: 12 }}>
          <PairingStepIndicator currentStep={currentStep} />
        </Grid>

        {/* Step 1: Input OTP */}
        {currentStep === "input" && (
          <>
            {/* Header Section */}
            <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                fontWeight={700}
              >
                Pair Your Device
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Enter the 6-digit code from your admin panel
              </Typography>
            </Grid>

            {/* Form Section */}
            <Grid size={{ xs: 12 }}>
              <FormSection onSubmit={handleSubmit}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="000000"
                    autoFocus
                    disabled={loading}
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
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, textAlign: "center" }}
                  >
                    ✓ {otp.length}/6 digits entered
                  </Typography>
                </Grid>

                {/* Error Display */}
                {errorDetails && (
                  <Grid size={{ xs: 12 }}>
                    <PairingErrorDisplay errorDetails={errorDetails} />
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
                    sx={{ py: 1.5 }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Continue →"
                    )}
                  </TouchButton>
                </Grid>
              </FormSection>
            </Grid>
          </>
        )}

        {/* Step 2: Verifying */}
        {currentStep === "verifying" && (
          <Grid size={{ xs: 12 }}>
            <PairingVerifyingStep />
          </Grid>
        )}

        {/* Step 3: Success */}
        {currentStep === "success" && pairingData && (
          <Grid size={{ xs: 12 }}>
            <PairingSuccessStep
              pairingData={pairingData}
              onContinue={handleContinue}
            />
          </Grid>
        )}
      </Grid>
    </CenteredPageLayout>
  );
};
