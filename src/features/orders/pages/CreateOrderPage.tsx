import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { container } from "tsyringe";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  ensureActiveTab,
  selectCartItems,
  updatePreview,
} from "../../../store/orderSlice";
import { StoresService } from "../../stores/services";
import { StoreDto } from "../../stores/types";
import { OrderActions } from "../components/LeftPanel/OrderActions";
import { OrderCart } from "../components/LeftPanel/OrderCart";
import { OrderTotals } from "../components/LeftPanel/OrderTotals";
import { OrderTabBar } from "../components/OrderTabBar";
import { CategoryGrid } from "../components/RightPanel/CategoryGrid";
import { ProductGrid } from "../components/RightPanel/ProductGrid";
import { OrdersService } from "../services/orders.service";

const ordersService = container.resolve(OrdersService);
const storesService = container.resolve(StoresService);

export const CreateOrderPage = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const [store, setStore] = useState<StoreDto | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  useEffect(() => {
    dispatch(ensureActiveTab());
    storesService.getCurrentStore().then(setStore);
  }, [dispatch]);

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

  // Fixed heights for left panel components
  const ITEMS_HEIGHT = 360; // Approximate height for totals section
  const TAB_BAR_HEIGHT = 64; // Approximate height for tab bar

  return (
    <Grid
      container
      sx={{
        height: 1,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        alignContent: "flex-start",
        overflowY: "hidden",
      }}
      rowSpacing={1}
    >
      {/* Tab Bar Row */}
      <Grid size={12} sx={{ height: `${TAB_BAR_HEIGHT}px` }}>
        <OrderTabBar />
      </Grid>

      {/* Main Content Row */}
      <Grid size={12} sx={{ height: `calc(100% - ${TAB_BAR_HEIGHT}px)` }}>
        <Grid container spacing={1} sx={{ height: 1 }}>
          {/* Left Panel */}
          <Grid
            size={{ xs: 12, sm: 12, md: 5, lg: 4, xl: 3 }}
            sx={{
              borderRight: { xs: 0, md: 1 },
              borderColor: "divider",
              bgcolor: "background.paper",
              height: 1,
            }}
          >
            <Grid container sx={{ height: 1 }}>
              {/* Scrollable Cart Area - Takes remaining space */}
              <Grid
                size={12}
                sx={{
                  height: ITEMS_HEIGHT,
                  overflowY: "auto",
                  overflowX: "hidden",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <OrderCart currency={store?.currency} />
              </Grid>

              {/* Fixed Totals - Fixed height */}
              <Grid size={12}>
                <OrderTotals currency={store?.currency} />
              </Grid>

              {/* Fixed Actions - Fixed height */}
              <Grid size={12}>
                <OrderActions
                  storeId={store?.id ?? ""}
                  currency={store?.currency}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Panel */}
          <Grid
            size={{ xs: 12, sm: 12, md: 7, lg: 8, xl: 9 }}
            sx={{
              height: 1,
            }}
          >
            <Grid container sx={{ height: 1 }}>
              {/* Categories Section - 25% of height */}
              <Grid
                size={12}
                sx={{
                  height: "30%",
                  borderBottom: 1,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  p: 2,
                  overflowY: "hidden",
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <CategoryGrid onCategorySelect={setSelectedCategoryId} />
              </Grid>

              {/* Products Section - 75% of height */}
              <Grid
                size={12}
                sx={{
                  height: "70%",
                  overflowY: "auto",
                  overflowX: "hidden",
                  WebkitOverflowScrolling: "touch",
                }}
                id="productScrollContainer"
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
        </Grid>
      </Grid>
    </Grid>
  );
};
