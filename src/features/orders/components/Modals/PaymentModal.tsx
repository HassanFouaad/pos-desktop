import { CreditCard as CardIcon, Money as CashIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { ResponsiveDialog } from "../../../../components/common/ResponsiveDialog";
import { PaymentMethod } from "../../../../db/enums";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  totalAmount: number;
  onSubmit: (amountPaid: number, paymentMethod: PaymentMethod) => void;
}

export const PaymentModal = ({
  open,
  onClose,
  totalAmount,
  onSubmit,
}: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH
  );
  const [amountPaid, setAmountPaid] = useState<string>(totalAmount.toFixed(2));
  const [error, setError] = useState<string>("");

  // Update amount paid when modal opens or total changes
  useEffect(() => {
    if (open) {
      setAmountPaid(totalAmount.toFixed(2));
      setError("");
    }
  }, [open, totalAmount]);

  const handleAmountChange = (value: string) => {
    setAmountPaid(value);
    setError("");
  };

  const handleQuickAmount = (multiplier: number) => {
    const roundedAmount = Math.ceil(totalAmount / multiplier) * multiplier;
    setAmountPaid(roundedAmount.toFixed(2));
  };

  const handleSubmit = () => {
    const amount = parseFloat(amountPaid);

    if (isNaN(amount) || amount <= 0) {
      console.error("Please enter a valid amount");
      setError("Please enter a valid amount");
      return;
    }

    if (amount < totalAmount) {
      console.error("Amount paid cannot be less than total");
      setError("Amount paid cannot be less than total");
      return;
    }

    console.log("handleSubmit", {
      amountPaid: amount,
      paymentMethod,
      totalAmount,
    });
    onSubmit(amount, paymentMethod);
  };

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title={
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Process Payment
        </Typography>
      }
      showCloseButton
      titleSx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        pb: 2,
      }}
      contentSx={{ pt: 3 }}
      actions={
        <>
          <Button onClick={onClose} variant="outlined" size="large">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            color="primary"
          >
            Pay
          </Button>
        </>
      }
      actionsSx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}
    >
      {/* Total Amount */}
      <Box
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          bgcolor: "primary.lighter",
          border: "1px solid",
          borderColor: "primary.light",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Total Amount
        </Typography>
        <Typography variant="h4" color="primary.main" fontWeight={800}>
          ${totalAmount.toFixed(2)}
        </Typography>
      </Box>

      {/* Payment Method */}
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Payment Method
      </Typography>
      <ToggleButtonGroup
        value={paymentMethod}
        exclusive
        onChange={(_, value) => value && setPaymentMethod(value)}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value={PaymentMethod.CASH}>
          <CashIcon sx={{ mr: 1 }} />
          Cash
        </ToggleButton>
        <ToggleButton value={PaymentMethod.CARD}>
          <CardIcon sx={{ mr: 1 }} />
          Card
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Amount Paid */}
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Amount Paid
      </Typography>
      <TextField
        fullWidth
        value={amountPaid}
        onChange={(e) => handleAmountChange(e.target.value)}
        type="number"
        error={!!error}
        helperText={error}
        InputProps={{
          startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
          sx: {
            fontSize: "1.5rem",
            fontWeight: 600,
          },
        }}
        sx={{ mb: 2 }}
      />

      {/* Quick Amount Buttons */}
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setAmountPaid(totalAmount.toFixed(2))}
          sx={{ flex: 1 }}
        >
          Exact
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleQuickAmount(5)}
          sx={{ flex: 1 }}
        >
          Round $5
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleQuickAmount(10)}
          sx={{ flex: 1 }}
        >
          Round $10
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleQuickAmount(20)}
          sx={{ flex: 1 }}
        >
          Round $20
        </Button>
      </Box>
    </ResponsiveDialog>
  );
};
