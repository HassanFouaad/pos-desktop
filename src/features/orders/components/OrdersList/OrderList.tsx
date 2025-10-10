import { CircularProgress, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { container } from "tsyringe";
import { OrdersService } from "../../services/orders.service";
import { OrderDto } from "../../types/order.types";
import { OrderListItem } from "./OrderListItem";
import { OrderSearch } from "./OrderSearch";

const ordersService = container.resolve(OrdersService);

const LIMIT = 20;

export const OrderList = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
    // TODO: Navigate to order details page or show order details modal
    console.log("Order clicked:", order);
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
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{ height: 1 }}
          >
            <CircularProgress />
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
    </Grid>
  );
};
