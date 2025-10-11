import { CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { container } from "tsyringe";
import { OrderStatus } from "../../../db/enums";
import { StoresService } from "../../stores/services";
import { StoreDto } from "../../stores/types";
import {
  OrderDetailsActions,
  OrderDetailsCustomer,
  OrderDetailsHeader,
  OrderDetailsItems,
  OrderDetailsNotes,
  OrderDetailsPayment,
  OrderDetailsTotals,
} from "../components/OrderDetails";
import { OrdersService } from "../services/orders.service";
import { OrderDto } from "../types/order.types";

const ordersService = container.resolve(OrdersService);
const storesService = container.resolve(StoresService);

const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [store, setStore] = useState<StoreDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!orderId) {
      setError("Order ID not provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fetchedOrder = await ordersService.getOrderById(orderId);

      if (!fetchedOrder) {
        setError("Order not found");
        setOrder(null);
      } else {
        setOrder(fetchedOrder);
      }
    } catch (err) {
      console.error("Failed to load order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    storesService.getCurrentStore().then(setStore);
  }, [orderId]);

  // Loading State
  if (loading) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ height: 1 }}
      >
        <Grid sx={{ textAlign: "center" }}>
          <CircularProgress size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading order details...
          </Typography>
        </Grid>
      </Grid>
    );
  }

  // Error State
  if (error || !order) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ height: 1 }}
      >
        <Grid sx={{ textAlign: "center" }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            {error || "Order not found"}
          </Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid
      container
      spacing={2}
      sx={{
        height: 1,
        overflowY: "auto",
        overflowX: "hidden",
        p: 2,
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Header Section */}
      <Grid size={{ xs: 12, md: 6 }}>
        <OrderDetailsHeader order={order} />
      </Grid>

      {/* Customer Section (if exists) */}
      {(order.customerName || order.customerPhone) && (
        <Grid size={{ xs: 12, md: 6 }}>
          <OrderDetailsCustomer
            order={order}
            onClick={
              order.customerId
                ? () => navigate(`/customers/${order.customerId}`)
                : undefined
            }
          />
        </Grid>
      )}

      {/* Items Section */}
      {order.items && order.items.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <OrderDetailsItems items={order.items} currency={store?.currency} />
        </Grid>
      )}

      {/* Totals Section */}
      <Grid size={{ xs: 12, md: 6 }}>
        <OrderDetailsTotals order={order} currency={store?.currency} />
      </Grid>

      {/* Payment Section */}
      <Grid size={{ xs: 12, md: 6 }}>
        <OrderDetailsPayment order={order} currency={store?.currency} />
      </Grid>

      {/* Notes Section (if exists) */}
      {order.notes && (
        <Grid size={{ xs: 12 }}>
          <OrderDetailsNotes notes={order.notes} />
        </Grid>
      )}

      {/* Actions for PENDING orders */}
      {order.status === OrderStatus.PENDING && (
        <Grid size={{ xs: 12 }}>
          <OrderDetailsActions
            order={order}
            onRefresh={fetchOrder}
            currency={store?.currency}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default OrderDetailsPage;
