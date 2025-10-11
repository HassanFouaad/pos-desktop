import { CreditCard as CardIcon, Money as CashIcon } from "@mui/icons-material";
import {
  Button,
  Grid,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { ResponsiveDialog } from "../../../../components/common/ResponsiveDialog";
import { PaymentMethod } from "../../../../db/enums";
import { formatCurrency } from "../../../products/utils/pricing";
import { OrderDto } from "../../types/order.types";
import { PaymentModalOrderItems } from "./PaymentModalOrderItems";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  totalAmount: number;
  onSubmit: (amountPaid: number, paymentMethod: PaymentMethod) => void;
  order: OrderDto | null;
  currency?: string;
}

export const PaymentModal = ({
  open,
  onClose,
  totalAmount,
  onSubmit,
  order,
  currency = "EGP",
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

  // Update amount paid when payment method changes
  useEffect(() => {
    if (paymentMethod === PaymentMethod.CARD) {
      // For card payments, amount must be exact
      setAmountPaid(totalAmount.toFixed(2));
      setError("");
    }
  }, [paymentMethod, totalAmount]);

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

    onSubmit(amount, paymentMethod);
  };

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      title={
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {order?.orderNumber}
        </Typography>
      }
      showCloseButton
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
      <Grid container spacing={2}>
        {/* Order Information */}
        {order && order.customerName && (
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" color="text.secondary">
              Customer: {order.customerName}
            </Typography>
          </Grid>
        )}

        {/* Order Items */}
        {order && order.items && order.items.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <PaymentModalOrderItems items={order.items} currency={currency} />
          </Grid>
        )}

        {/* Total Amount */}
        <Grid size={{ xs: 12 }}>
          <Grid container sx={{ p: 1, textAlign: "center" }}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="h4" color="primary.main" fontWeight={800}>
                {formatCurrency(totalAmount, currency)}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Payment Method */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Payment Method
          </Typography>
          <ToggleButtonGroup
            value={paymentMethod}
            exclusive
            onChange={(_, value) => value && setPaymentMethod(value)}
            fullWidth
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
        </Grid>

        {/* Amount Paid */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Amount Paid
          </Typography>
          <TextField
            fullWidth
            value={amountPaid}
            onChange={(e) => handleAmountChange(e.target.value)}
            type="number"
            error={!!error}
            helperText={
              error ||
              (paymentMethod === PaymentMethod.CARD
                ? "Card payments must be exact amount"
                : undefined)
            }
            disabled={paymentMethod === PaymentMethod.CARD}
            InputProps={{
              sx: {
                fontSize: "1.5rem",
                fontWeight: 600,
              },
            }}
          />
        </Grid>

        {/* Quick Amount Buttons - Only for cash payments */}
        {paymentMethod === PaymentMethod.CASH && (
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 3 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setAmountPaid(totalAmount.toFixed(2))}
                  fullWidth
                >
                  Exact
                </Button>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickAmount(5)}
                  fullWidth
                >
                  Round {formatCurrency(5, currency)}
                </Button>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickAmount(10)}
                  fullWidth
                >
                  Round {formatCurrency(10, currency)}
                </Button>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickAmount(20)}
                  fullWidth
                >
                  Round {formatCurrency(20, currency)}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </ResponsiveDialog>
  );
};
