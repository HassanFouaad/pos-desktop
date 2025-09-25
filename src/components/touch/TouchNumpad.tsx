import {
  Backspace as BackspaceIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Box, IconButton, Paper, Stack, styled, Typography } from "@mui/material";
import { useState } from "react";
import { TouchButton } from "./TouchButton";

const NumpadContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  borderRadius: theme.spacing(2),
  // boxShadow is handled by theme
  backgroundColor: theme.palette.background.paper,
  width: "100%",
  maxWidth: "400px",
}));

const Display = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  fontSize: "2rem",
  textAlign: "right",
  fontFamily: "monospace",
  minHeight: "64px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
}));

const ButtonGrid = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "8px",
  width: "100%",
}));

export interface TouchNumpadProps {
  initialValue?: string;
  allowDecimals?: boolean;
  maxDigits?: number;
  onValueChange?: (value: string) => void;
  onConfirm?: (value: string) => void;
  onCancel?: () => void;
}

export const TouchNumpad = ({
  initialValue = "0",
  allowDecimals = true,
  maxDigits = 10,
  onValueChange,
  onConfirm,
  onCancel,
}: TouchNumpadProps) => {
  const [value, setValue] = useState(initialValue);

  const handleButtonClick = (digit: string) => {
    let newValue = value;

    // Handle decimal point
    if (digit === "." && !allowDecimals) return;
    if (digit === "." && value.includes(".")) return;

    // Handle digits
    if (digit !== ".") {
      if (value === "0") {
        newValue = digit;
      } else {
        // Check if adding the digit would exceed maxDigits
        // For numbers with decimals, we don't count the decimal point
        const valueWithoutDecimal = value.replace(".", "");
        if (valueWithoutDecimal.length >= maxDigits) return;
        newValue = value + digit;
      }
    } else {
      // Decimal point
      if (value === "0" || value === "") {
        newValue = "0.";
      } else {
        newValue = value + ".";
      }
    }

    setValue(newValue);
    if (onValueChange) onValueChange(newValue);
  };

  const handleBackspace = () => {
    if (value.length <= 1) {
      setValue("0");
    } else {
      const newValue = value.slice(0, -1);
      setValue(newValue);
      if (onValueChange) onValueChange(newValue);
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm(value);
  };

  return (
    <NumpadContainer>
      <Display>
        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
      </Display>

      <ButtonGrid>
        {/* First row */}
        <TouchButton variant="text" onClick={() => handleButtonClick("7")}>
          7
        </TouchButton>
        <TouchButton variant="text" onClick={() => handleButtonClick("8")}>
          8
        </TouchButton>
        <TouchButton variant="text" onClick={() => handleButtonClick("9")}>
          9
        </TouchButton>

        {/* Second row */}
        <TouchButton variant="text" onClick={() => handleButtonClick("4")}>
          4
        </TouchButton>
        <TouchButton variant="text" onClick={() => handleButtonClick("5")}>
          5
        </TouchButton>
        <TouchButton variant="text" onClick={() => handleButtonClick("6")}>
          6
        </TouchButton>

        {/* Third row */}
        <TouchButton variant="text" onClick={() => handleButtonClick("1")}>
          1
        </TouchButton>
        <TouchButton variant="text" onClick={() => handleButtonClick("2")}>
          2
        </TouchButton>
        <TouchButton variant="text" onClick={() => handleButtonClick("3")}>
          3
        </TouchButton>

        {/* Fourth row */}
        {allowDecimals ? (
          <TouchButton variant="text" onClick={() => handleButtonClick(".")}>
            .
          </TouchButton>
        ) : (
          <Box /> // Empty space if decimals not allowed
        )}
        <TouchButton variant="text" onClick={() => handleButtonClick("0")}>
          0
        </TouchButton>
        <IconButton
          size="large"
          onClick={handleBackspace}
          sx={{
            bgcolor: (theme) => theme.palette.grey[200],
            "&:hover": {
              bgcolor: (theme) => theme.palette.grey[300],
            },
          }}
        >
          <BackspaceIcon />
        </IconButton>
      </ButtonGrid>

      {/* Action buttons */}
      <Stack direction="row" spacing={2} justifyContent="space-between" mt={1}>
        <TouchButton
          color="error"
          variant="contained"
          onClick={onCancel}
          startIcon={<CloseIcon />}
          sx={{ flexGrow: 1 }}
        >
          Cancel
        </TouchButton>
        <TouchButton
          color="primary"
          variant="contained"
          onClick={handleConfirm}
          endIcon={<CheckIcon />}
          sx={{ flexGrow: 1 }}
        >
          Confirm
        </TouchButton>
      </Stack>
    </NumpadContainer>
  );
};
