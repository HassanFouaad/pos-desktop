/**
 * Pairing Verifying Step Component
 * Shows animated progress during the verification phase
 */

import {
  CheckCircle as CheckCircleIcon,
  Sync as SyncIcon,
} from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";

interface VerificationStep {
  label: string;
  duration: number; // milliseconds
}

const verificationSteps: VerificationStep[] = [
  { label: "Connecting to server", duration: 800 },
  { label: "Validating pairing code", duration: 1000 },
  { label: "Setting up device security", duration: 1200 },
  { label: "Finalizing pairing", duration: 800 },
];

export function PairingVerifyingStep() {
  const theme = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (currentStepIndex >= verificationSteps.length) return;

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => prev + 1);
    }, verificationSteps[currentStepIndex].duration);

    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  return (
    <Grid container spacing={3}>
      {/* Title */}
      <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Verifying Device
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Please wait while we set up your device
        </Typography>
      </Grid>

      {/* Main Progress Indicator */}
      <Grid size={{ xs: 12 }} sx={{ textAlign: "center", py: 3 }}>
        <CircularProgress
          size={80}
          thickness={4}
          sx={{
            color: theme.palette.primary.main,
          }}
        />
      </Grid>

      {/* Verification Steps */}
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
          <List disablePadding>
            {verificationSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <ListItem
                  key={step.label}
                  sx={{
                    py: 1.5,
                    opacity: isPending ? 0.5 : 1,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {isCompleted ? (
                      <CheckCircleIcon
                        sx={{
                          color: theme.palette.success.main,
                          fontSize: 28,
                        }}
                      />
                    ) : isCurrent ? (
                      <CircularProgress
                        size={24}
                        sx={{ color: theme.palette.primary.main }}
                      />
                    ) : (
                      <SyncIcon
                        sx={{
                          color: theme.palette.text.disabled,
                          fontSize: 24,
                        }}
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={step.label}
                    primaryTypographyProps={{
                      fontWeight: isCurrent ? 600 : 400,
                      color:
                        isCompleted || isCurrent
                          ? "text.primary"
                          : "text.disabled",
                      fontSize: "1.1rem",
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Grid>

      {/* Help Text */}
      <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          This should only take a moment...
        </Typography>
      </Grid>
    </Grid>
  );
}
