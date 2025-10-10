/**
 * Pairing Step Indicator Component
 * Visual progress indicator showing the current step in the pairing flow
 */

import {
  CheckCircle as CheckCircleIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from "@mui/icons-material";
import { Box, Step, StepLabel, Stepper, useTheme } from "@mui/material";

export type PairingStep = "input" | "verifying" | "success";

interface PairingStepIndicatorProps {
  currentStep: PairingStep;
}

const steps = [
  { key: "input" as PairingStep, label: "Enter Code" },
  { key: "verifying" as PairingStep, label: "Verifying" },
  { key: "success" as PairingStep, label: "Complete" },
];

export function PairingStepIndicator({
  currentStep,
}: PairingStepIndicatorProps) {
  const theme = useTheme();

  const getStepIndex = (step: PairingStep): number => {
    return steps.findIndex((s) => s.key === step);
  };

  const currentStepIndex = getStepIndex(currentStep);

  const getStepIcon = (index: number) => {
    if (index < currentStepIndex) {
      return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
    } else if (index === currentStepIndex) {
      return (
        <RadioButtonCheckedIcon sx={{ color: theme.palette.primary.main }} />
      );
    } else {
      return (
        <RadioButtonUncheckedIcon sx={{ color: theme.palette.text.disabled }} />
      );
    }
  };

  return (
    <Box sx={{ width: 1 }}>
      <Stepper activeStep={currentStepIndex} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={step.key} completed={index < currentStepIndex}>
            <StepLabel
              StepIconComponent={() => getStepIcon(index)}
              sx={{
                "& .MuiStepLabel-label": {
                  color:
                    index <= currentStepIndex
                      ? theme.palette.text.primary
                      : theme.palette.text.disabled,
                  fontWeight: index === currentStepIndex ? 600 : 400,
                },
              }}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
