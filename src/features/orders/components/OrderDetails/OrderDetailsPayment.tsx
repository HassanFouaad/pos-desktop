import {
  CreditCard as CardIcon,
  LocalAtm as CashIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";
import { Chip, Grid, Typography, useTheme } from "@mui/material";
import { InfoCard } from "../../../../components/cards/InfoCard";
import { PaymentMethod, PaymentStatus } from "../../../../db/enums";
import { formatCurrency } from "../../../products/utils/pricing";
import { OrderDto } from "../../types/order.types";

interface OrderDetailsPaymentProps {
  order: OrderDto;
  currency?: string;
}

const getPaymentMethodIcon = (method?: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.CASH:
      return <CashIcon sx={{ fontSize: 18 }} />;
    case PaymentMethod.CARD:
      return <CardIcon sx={{ fontSize: 18 }} />;
    default:
      return undefined;
  }
};

const getPaymentMethodColor = (
  method?: PaymentMethod
): "success" | "primary" | "default" => {
  switch (method) {
    case PaymentMethod.CASH:
      return "success";
    case PaymentMethod.CARD:
      return "primary";
    default:
      return "default";
  }
};

const getPaymentStatusColor = (
  status: PaymentStatus
): "success" | "warning" | "error" | "default" => {
  switch (status) {
    case PaymentStatus.PAID:
      return "success";
    case PaymentStatus.PARTIAL:
      return "warning";
    case PaymentStatus.PENDING:
      return "error";
    default:
      return "default";
  }
};

export const OrderDetailsPayment = ({
  order,
  currency = "EGP",
}: OrderDetailsPaymentProps) => {
  const theme = useTheme();

  return (
    <InfoCard
      title="Payment Information"
      icon={<PaymentIcon sx={{ fontSize: 32 }} />}
      iconColor={theme.palette.secondary.main}
      backgroundColor="paper"
    >
      <Grid container spacing={2}>
        {/* Payment Method & Status */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={1} alignItems="center">
            {order.paymentMethod && (
              <Grid size="auto">
                <Chip
                  icon={getPaymentMethodIcon(order.paymentMethod)}
                  label={order.paymentMethod}
                  size="small"
                  variant="outlined"
                  color={getPaymentMethodColor(order.paymentMethod)}
                  sx={{ fontWeight: 600 }}
                />
              </Grid>
            )}
            <Grid size="auto">
              <Chip
                label={order.paymentStatus}
                size="small"
                variant="outlined"
                color={getPaymentStatusColor(order.paymentStatus)}
                sx={{ fontWeight: 600 }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Amount Paid */}
        {order.amountPaid > 0 && (
          <Grid size={{ xs: 12 }}>
            <Grid container>
              <Grid size="grow">
                <Typography variant="body2" color="text.secondary">
                  Amount Paid
                </Typography>
              </Grid>
              <Grid size="auto">
                <Typography variant="body1" fontWeight={600}>
                  {formatCurrency(order.amountPaid, currency)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Amount Due */}
        {order.amountDue > 0 && (
          <Grid size={{ xs: 12 }}>
            <Grid container>
              <Grid size="grow">
                <Typography variant="body2" color="text.secondary">
                  Amount Due
                </Typography>
              </Grid>
              <Grid size="auto">
                <Typography variant="body1" fontWeight={600} color="error.main">
                  {formatCurrency(order.amountDue, currency)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Change Given */}
        {order.changeGiven > 0 && (
          <Grid size={{ xs: 12 }}>
            <Grid container>
              <Grid size="grow">
                <Typography variant="body2" color="text.secondary">
                  Change Given
                </Typography>
              </Grid>
              <Grid size="auto">
                <Typography
                  variant="body1"
                  fontWeight={600}
                  color="success.main"
                >
                  {formatCurrency(order.changeGiven, currency)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </InfoCard>
  );
};
