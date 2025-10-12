import {
  CreditCard as CardIcon,
  Money as CashIcon,
  CheckCircle as CheckIcon,
  CardGiftcard as GiftCardIcon,
  Payment as MixedIcon,
  AccountBalance as StoreCreditIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { container } from "tsyringe";
import { ResponsiveDialog } from "../../../../components/common/ResponsiveDialog";
import { PaymentMethod } from "../../../../db/enums";
import { formatCurrency } from "../../../products/utils/pricing";
import { StorePaymentMethodsService } from "../../../stores/services";
import { OrderDto } from "../../types/order.types";
import { PaymentModalOrderItems } from "./PaymentModalOrderItems";

const storePaymentMethodsService = container.resolve(
  StorePaymentMethodsService
);

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  totalAmount: number;
  onSubmit: (amountPaid: number, paymentMethod: PaymentMethod) => void;
  order: OrderDto | null;
  currency?: string;
}

/**
 * Get icon for payment method
 */
const getPaymentMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.CASH:
      return <CashIcon sx={{ fontSize: 32 }} />;
    case PaymentMethod.CARD:
      return <CardIcon sx={{ fontSize: 32 }} />;
    case PaymentMethod.CHECK:
      return <CheckIcon sx={{ fontSize: 32 }} />;
    case PaymentMethod.STORE_CREDIT:
      return <StoreCreditIcon sx={{ fontSize: 32 }} />;
    case PaymentMethod.GIFT_CARD:
      return <GiftCardIcon sx={{ fontSize: 32 }} />;
    case PaymentMethod.MIXED:
      return <MixedIcon sx={{ fontSize: 32 }} />;
    default:
      return <CashIcon sx={{ fontSize: 32 }} />;
  }
};

/**
 * Get display name for payment method
 */
const getPaymentMethodName = (method: PaymentMethod): string => {
  switch (method) {
    case PaymentMethod.CASH:
      return "Cash";
    case PaymentMethod.CARD:
      return "Card";
    case PaymentMethod.CHECK:
      return "Check";
    case PaymentMethod.STORE_CREDIT:
      return "Store Credit";
    case PaymentMethod.GIFT_CARD:
      return "Gift Card";
    case PaymentMethod.MIXED:
      return "Mixed";
    default:
      return method;
  }
};

export const PaymentModal = ({
  open,
  onClose,
  totalAmount,
  onSubmit,
  order,
  currency = "EGP",
}: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [amountPaid, setAmountPaid] = useState<string>(totalAmount.toFixed(2));
  const [error, setError] = useState<string>("");
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<
    PaymentMethod[]
  >([]);
  const [loadingMethods, setLoadingMethods] = useState(false);

  // Fetch available payment methods when modal opens
  useEffect(() => {
    if (open && order?.storeId) {
      fetchPaymentMethods();
    }
  }, [open, order?.storeId]);

  const fetchPaymentMethods = async () => {
    if (!order?.storeId) return;

    setLoadingMethods(true);
    try {
      const methods = await storePaymentMethodsService.getActivePaymentMethods(
        order.storeId
      );

      // Extract payment method enum values and sort by common order
      const methodValues = methods.map((m) => m.paymentMethod);

      // Sort: CASH first, then CARD, then others
      const sortedMethods = methodValues.sort((a, b) => {
        const order = [
          PaymentMethod.CASH,
          PaymentMethod.CARD,
          PaymentMethod.CHECK,
          PaymentMethod.STORE_CREDIT,
          PaymentMethod.GIFT_CARD,
          PaymentMethod.MIXED,
        ];
        return order.indexOf(a) - order.indexOf(b);
      });

      setAvailablePaymentMethods(sortedMethods);

      // Auto-select first method if available
      if (sortedMethods.length > 0 && !paymentMethod) {
        setPaymentMethod(sortedMethods[0]);
      }
    } catch (err) {
      console.error("Failed to fetch payment methods:", err);
      // Fallback to CASH if fetch fails
      setAvailablePaymentMethods([PaymentMethod.CASH]);
      setPaymentMethod(PaymentMethod.CASH);
    } finally {
      setLoadingMethods(false);
    }
  };

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
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

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
            disabled={!paymentMethod}
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
          <Grid container sx={{ textAlign: "center" }}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="h5" color="primary.main" fontWeight={800}>
                {formatCurrency(totalAmount, currency)}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Amount Paid */}
        {paymentMethod && (
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontWeight: 600, fontSize: "0.95rem" }}
            >
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
        )}
        {/* Payment Method Selection */}
        <Grid size={{ xs: 12 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1.5, fontWeight: 600, fontSize: "0.95rem" }}
          >
            Payment Method
          </Typography>

          {loadingMethods ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress />
            </Box>
          ) : availablePaymentMethods.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "action.hover",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No payment methods available for this store
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={1.5}>
              {availablePaymentMethods.map((method) => (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={method}>
                  <Card
                    elevation={0}
                    sx={{
                      border: "2px solid",
                      borderColor:
                        paymentMethod === method ? "primary.main" : "divider",
                      bgcolor:
                        paymentMethod === method
                          ? "primary.lighter"
                          : "background.paper",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "primary.light",
                        transform: "translateY(-2px)",
                        boxShadow: 2,
                      },
                      "&:active": {
                        transform: "translateY(0)",
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => setPaymentMethod(method)}
                      sx={{
                        p: 1,
                        minHeight: 50,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          color:
                            paymentMethod === method
                              ? "primary.main"
                              : "text.secondary",
                        }}
                      >
                        {getPaymentMethodIcon(method)}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: paymentMethod === method ? 700 : 600,
                          color:
                            paymentMethod === method
                              ? "primary.main"
                              : "text.primary",
                          textAlign: "center",
                          fontSize: "0.9rem",
                        }}
                      >
                        {getPaymentMethodName(method)}
                      </Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
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
