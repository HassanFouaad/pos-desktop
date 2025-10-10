import {
  CreditCard,
  Event,
  LocalAtm,
  MonetizationOn,
  Person,
  Phone,
  Receipt,
  ShoppingCart,
  TrendingDown,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { PaymentMethod, PaymentStatus } from "../../../../db/enums";
import { formatCurrency } from "../../../products/utils/pricing";
import { OrderDto } from "../../types/order.types";

interface OrderListItemProps {
  order: OrderDto;
  onClick?: (order: OrderDto) => void;
}

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}) => (
  <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
    <Tooltip title={label}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          color: "text.secondary",
        }}
      >
        {icon}
        <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500 }} noWrap>
          {value || "N/A"}
        </Typography>
      </Box>
    </Tooltip>
  </Grid>
);

const getPaymentMethodIcon = (method?: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.CASH:
      return <LocalAtm sx={{ fontSize: 18 }} />;
    case PaymentMethod.CARD:
      return <CreditCard sx={{ fontSize: 18 }} />;
    default:
      return <MonetizationOn sx={{ fontSize: 18 }} />;
  }
};

const getPaymentMethodColor = (method?: PaymentMethod): string => {
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

export const OrderListItem = ({ order, onClick }: OrderListItemProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(order);
    }
  };

  const itemCount =
    order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const cardContent = (
    <Grid container spacing={2}>
      {/* Header Row */}
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid size="grow">
            <Typography variant="h6" fontWeight={600}>
              Order #{order.orderNumber}
            </Typography>
          </Grid>
          <Grid size="auto">
            <Chip
              label={order.status}
              size="small"
              color={
                order.status === "completed"
                  ? "success"
                  : order.status === "pending"
                  ? "warning"
                  : order.status === "voided"
                  ? "error"
                  : "default"
              }
              sx={{ fontWeight: 600 }}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Order Details */}
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={1.5}>
          <DetailItem
            icon={<Receipt sx={{ fontSize: 18 }} />}
            label="Order Number"
            value={order.orderNumber}
          />
          <DetailItem
            icon={<MonetizationOn sx={{ fontSize: 18 }} />}
            label="Total Amount"
            value={formatCurrency(order.totalAmount, "EGP")}
          />
          <DetailItem
            icon={<ShoppingCart sx={{ fontSize: 18 }} />}
            label="Number of Items"
            value={`${itemCount} item${itemCount !== 1 ? "s" : ""}`}
          />
          {order.totalDiscount > 0 && (
            <DetailItem
              icon={<TrendingDown sx={{ fontSize: 18 }} />}
              label="Discount"
              value={formatCurrency(order.totalDiscount, "EGP")}
            />
          )}
          <DetailItem
            icon={<Event sx={{ fontSize: 18 }} />}
            label="Order Date"
            value={dayjs(order.orderDate).format("MMM D, YYYY h:mm A")}
          />
        </Grid>
      </Grid>

      {/* Customer Info */}
      {(order.customerName || order.customerPhone) && (
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              Customer Information
            </Typography>
            <Grid container spacing={1}>
              {order.customerName && (
                <DetailItem
                  icon={<Person sx={{ fontSize: 18 }} />}
                  label="Customer Name"
                  value={order.customerName}
                />
              )}
              {order.customerPhone && (
                <DetailItem
                  icon={<Phone sx={{ fontSize: 18 }} />}
                  label="Customer Phone"
                  value={order.customerPhone}
                />
              )}
            </Grid>
          </Box>
        </Grid>
      )}

      {/* Payment Info */}
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid size="auto">
            <Chip
              icon={getPaymentMethodIcon(order.paymentMethod)}
              label={order.paymentMethod || "N/A"}
              size="small"
              variant="outlined"
              color={getPaymentMethodColor(order.paymentMethod) as any}
              sx={{ fontWeight: 600 }}
            />
          </Grid>
          <Grid size="auto">
            <Chip
              label={order.paymentStatus}
              size="small"
              color={getPaymentStatusColor(order.paymentStatus)}
              sx={{ fontWeight: 600 }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <Grid size={{ xs: 12 }}>
      <Card sx={{ p: 2 }}>
        {onClick ? (
          <CardActionArea onClick={handleClick}>{cardContent}</CardActionArea>
        ) : (
          cardContent
        )}
      </Card>
    </Grid>
  );
};
