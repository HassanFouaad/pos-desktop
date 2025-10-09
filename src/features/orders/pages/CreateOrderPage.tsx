import { Box, Grid, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  resetOrder,
  selectCartItems,
  updatePreview,
} from "../../../store/orderSlice";
import { storesRepository } from "../../stores/repositories/stores.repository";
import { StoreDto } from "../../stores/types";
import { OrderActions } from "../components/LeftPanel/OrderActions";
import { OrderCart } from "../components/LeftPanel/OrderCart";
import { OrderTotals } from "../components/LeftPanel/OrderTotals";
import { CategoryGrid } from "../components/RightPanel/CategoryGrid";
import { ProductGrid } from "../components/RightPanel/ProductGrid";
import { ordersService } from "../services/orders.service";

export const CreateOrderPage = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const [store, setStore] = useState<StoreDto | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  // Load store on mount
  useEffect(() => {
    const loadStore = async () => {
      const store = await storesRepository.getCurrentStore();
      setStore(store);
    };

    loadStore();

    return () => {
      // Cleanup on unmount
      dispatch(resetOrder());
    };
  }, [dispatch]);

  // Update preview when cart items change
  useEffect(() => {
    const updateOrderPreview = async () => {
      if (!store?.id || cartItems.length === 0) {
        dispatch(
          updatePreview({
            items: [],
            subtotal: 0,
            totalDiscount: 0,
            totalTax: 0,
            totalAmount: 0,
          })
        );
        return;
      }

      try {
        const previewData = await ordersService.previewOrder(
          cartItems,
          store.id
        );
        dispatch(updatePreview(previewData));
      } catch (error) {
        console.error("Failed to update preview:", error);
      }
    };

    updateOrderPreview();
  }, [cartItems, store?.id, dispatch]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: { xs: "auto", md: "100vh" },
        bgcolor: theme.palette.background.default,
        display: "flex",
        flexDirection: "column",
        overflow: { xs: "auto", md: "hidden" },
      }}
    >
      <Grid
        container
        sx={{
          height: { xs: "auto", md: "100%" },
          flexGrow: 1,
        }}
        columnSpacing={{ xs: 0, md: 1 }}
      >
        {/* Left Panel - Order Details */}
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 5,
            lg: 4,
          }}
          sx={{
            minHeight: { xs: "50vh", md: "100%" },
            height: { xs: "auto", md: "100%" },
            display: "flex",
            flexDirection: "column",
            borderRight: {
              xs: "none",
              md: `1px solid ${theme.palette.divider}`,
            },
            borderBottom: {
              xs: `1px solid ${theme.palette.divider}`,
              md: "none",
            },
            bgcolor: theme.palette.background.paper,
            overflow: "hidden",
          }}
        >
          {/* Cart Items - Scrollable */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: 2,
              minHeight: { xs: "200px", md: "auto" },
            }}
          >
            <OrderCart />
          </Box>

          {/* Totals - Fixed at bottom */}
          <Box
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <OrderTotals />
            {store?.id && <OrderActions storeId={store.id} />}
          </Box>
        </Grid>

        {/* Right Panel - Products */}
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 7,
            lg: 8,
          }}
          container
          sx={{
            height: { xs: "auto", md: "100%" },
            minHeight: { xs: "50vh", md: "auto" },
          }}
          rowSpacing={{ xs: 1, md: 0 }}
        >
          {/* Category Grid - Top section */}
          <Grid
            size={{ xs: 12 }}
            sx={{
              height: { xs: "auto", md: "30%" },
              minHeight: { xs: "150px", md: "auto" },
            }}
          >
            <Box
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
                p: 2,
                height: "100%",
                overflow: "auto",
              }}
            >
              <CategoryGrid onCategorySelect={setSelectedCategoryId} />
            </Box>
          </Grid>

          {/* Product Grid - Bottom section */}
          <Grid
            size={{ xs: 12 }}
            sx={{
              height: { xs: "auto", md: "70%" },
              minHeight: { xs: "300px", md: "auto" },
            }}
          >
            {store?.id && (
              <ProductGrid
                categoryId={selectedCategoryId}
                storeId={store.id}
                store={store}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
