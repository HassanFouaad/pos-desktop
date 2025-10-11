import { CircularProgress, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";
import { container } from "tsyringe";
import { OrderStatus, PaymentMethod } from "../../../../db/enums";
import { OrdersService } from "../../services/orders.service";
import { OrderDto } from "../../types/order.types";
import { OrderConfirmationDialog } from "../Modals/OrderConfirmationDialog";
import { PaymentModal } from "../Modals/PaymentModal";
import { OrderListItem } from "./OrderListItem";
import { OrderSearch } from "./OrderSearch";
import { OrderSkeleton } from "./OrderSkeleton";

const ordersService = container.resolve(OrdersService);

const LIMIT = 20;

export const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // State for PENDING order handling
  const [selectedPendingOrder, setSelectedPendingOrder] =
    useState<OrderDto | null>(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchOrders = useCallback(async (search: string, offset: number) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedOrders = await ordersService.getOrders(
        search || undefined,
        LIMIT,
        offset
      );
      setOrders((prev) =>
        offset === 0 ? fetchedOrders : [...prev, ...fetchedOrders]
      );
      setHasMore(fetchedOrders.length === LIMIT);
    } catch (err) {
      setError("Failed to load orders.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(searchTerm, 0);
  }, [searchTerm, fetchOrders]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchOrders(searchTerm, orders.length);
    }
  };

  const handleOrderClick = (order: OrderDto) => {
    if (order.status === OrderStatus.PENDING) {
      // For PENDING orders, show confirmation dialog
      setSelectedPendingOrder(order);
      setShowConfirmationDialog(true);
    } else {
      // For other statuses, navigate to details page
      navigate(`/orders/${order.id}`);
    }
  };

  const handleComplete = () => {
    // Close confirmation dialog and open payment modal
    setShowConfirmationDialog(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (
    amountPaid: number,
    method: PaymentMethod
  ) => {
    if (!selectedPendingOrder) return;

    try {
      await ordersService.completeOrder({
        orderId: selectedPendingOrder.id,
        paymentMethod: method,
        amountPaid: amountPaid,
        orderDate: new Date(),
      });

      // Close modal and refresh list
      setShowPaymentModal(false);
      setSelectedPendingOrder(null);
      fetchOrders(searchTerm, 0);
    } catch (error) {
      console.error("Failed to complete order:", error);
    }
  };

  const handleVoid = async () => {
    if (!selectedPendingOrder) return;

    try {
      await ordersService.voidOrder({
        orderId: selectedPendingOrder.id,
      });

      // Close dialogs and refresh list
      setShowConfirmationDialog(false);
      setShowPaymentModal(false);
      setSelectedPendingOrder(null);
      fetchOrders(searchTerm, 0);
    } catch (error) {
      console.error("Failed to void order:", error);
    }
  };

  const handleDialogClose = () => {
    setShowConfirmationDialog(false);
  };

  return (
    <Grid
      container
      sx={{
        height: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Search - Fixed */}
      <Grid size={12} sx={{ flexShrink: 0 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <OrderSearch
              onSearch={setSearchTerm}
              placeholder="Search orders by order number..."
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Scrollable Orders List - Takes remaining space */}
      <Grid
        size={12}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          pt: 2,
        }}
      >
        {loading && orders.length === 0 ? (
          <Grid container spacing={2} sx={{ p: 2 }}>
            {[...Array(5)].map((_, index) => (
              <OrderSkeleton key={index} />
            ))}
          </Grid>
        ) : error ? (
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{ height: 1 }}
          >
            <Typography color="error">{error}</Typography>
          </Grid>
        ) : (
          <Grid
            id="scrollableDivOrders"
            sx={{
              height: 1,
              overflowY: "auto",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <InfiniteScroll
              dataLength={orders.length}
              next={loadMore}
              hasMore={hasMore}
              loader={
                <Grid
                  container
                  justifyContent="center"
                  alignItems="center"
                  sx={{ p: 2 }}
                >
                  <CircularProgress />
                </Grid>
              }
              endMessage={
                <Typography
                  sx={{ textAlign: "center", p: 2, color: "text.secondary" }}
                >
                  No more orders to show.
                </Typography>
              }
              scrollableTarget="scrollableDivOrders"
              style={{ overflow: "visible" }}
            >
              <Grid container spacing={2} sx={{ p: 2 }}>
                {orders.map((order) => (
                  <OrderListItem
                    key={order.id}
                    order={order}
                    onClick={handleOrderClick}
                  />
                ))}
              </Grid>
            </InfiniteScroll>
          </Grid>
        )}
      </Grid>

      {/* Confirmation Dialog for PENDING orders */}
      {selectedPendingOrder && (
        <>
          <OrderConfirmationDialog
            open={showConfirmationDialog}
            onClose={handleDialogClose}
            totalAmount={selectedPendingOrder.totalAmount}
            changeAmount={0}
            orderNumber={selectedPendingOrder.orderNumber}
            paymentMethod={
              selectedPendingOrder.paymentMethod || PaymentMethod.CASH
            }
            onComplete={handleComplete}
            onVoid={handleVoid}
            currency="EGP"
          />

          <PaymentModal
            open={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            totalAmount={selectedPendingOrder.totalAmount}
            onSubmit={handlePaymentSubmit}
            order={selectedPendingOrder}
            currency="EGP"
          />
        </>
      )}
    </Grid>
  );
};
