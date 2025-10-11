import { CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { container } from "tsyringe";
import { OrderListItem } from "../../../orders/components/OrdersList/OrderListItem";
import { OrdersService } from "../../../orders/services/orders.service";
import { OrderDto } from "../../../orders/types/order.types";

const ordersService = container.resolve(OrdersService);

const LIMIT = 5;

interface CustomerDetailsOrdersProps {
  customerId: string;
}

export const CustomerDetailsOrders = ({
  customerId,
}: CustomerDetailsOrdersProps) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedOrders = await ordersService.getOrdersByCustomerId(
          customerId,
          LIMIT,
          0
        );
        setOrders(fetchedOrders);
      } catch (err) {
        setError("Failed to load orders.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerId]);

  const handleOrderClick = (order: OrderDto) => {
    navigate(`/orders/${order.id}`);
  };

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ p: 4 }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid size={{ xs: 12 }}>
        <Typography color="error" sx={{ textAlign: "center", p: 2 }}>
          {error}
        </Typography>
      </Grid>
    );
  }

  if (orders.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      {orders.map((order) => (
        <OrderListItem
          key={order.id}
          order={order}
          onClick={handleOrderClick}
        />
      ))}
    </Grid>
  );
};
