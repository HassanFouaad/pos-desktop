import { Event as DateIcon, Receipt as OrderIcon } from "@mui/icons-material";
import { Chip, Grid, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { InfoCard } from "../../../../components/cards/InfoCard";
import { OrderStatus } from "../../../../db/enums";
import { OrderDto } from "../../types/order.types";

interface OrderDetailsHeaderProps {
  order: OrderDto;
}

const getOrderStatusColor = (
  status: OrderStatus
): "success" | "warning" | "error" | "default" => {
  switch (status) {
    case OrderStatus.COMPLETED:
      return "success";
    case OrderStatus.PENDING:
      return "warning";
    case OrderStatus.VOIDED:
      return "error";
    default:
      return "default";
  }
};

export const OrderDetailsHeader = ({ order }: OrderDetailsHeaderProps) => {
  const theme = useTheme();

  return (
    <InfoCard
      icon={<OrderIcon sx={{ fontSize: 32 }} />}
      iconColor={theme.palette.primary.main}
      backgroundColor="paper"
    >
      <Grid container spacing={2}>
        {/* Order Number & Status */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={1} alignItems="center">
            <Grid size="grow">
              <Typography variant="h5" fontWeight={700}>
                Order #{order.orderNumber}
              </Typography>
            </Grid>
            <Grid size="auto">
              <Chip
                label={order.status}
                size="medium"
                variant="outlined"
                color={getOrderStatusColor(order.status)}
                sx={{ fontWeight: 600 }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Order Date */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={1} alignItems="center">
            <Grid size="auto">
              <DateIcon sx={{ fontSize: 20, color: "text.secondary" }} />
            </Grid>
            <Grid size="auto">
              <Typography variant="body2" color="text.secondary">
                {dayjs(order.orderDate).format("MMMM D, YYYY h:mm A")}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Completed Date (if applicable) */}
        {order.completedAt && (
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid size="auto">
                <DateIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              </Grid>
              <Grid size="auto">
                <Typography variant="body2" color="text.secondary">
                  Completed:{" "}
                  {dayjs(order.completedAt).format("MMMM D, YYYY h:mm A")}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </InfoCard>
  );
};
