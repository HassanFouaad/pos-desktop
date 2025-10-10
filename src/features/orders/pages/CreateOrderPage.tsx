import {
  Check as CheckIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import { Button, Grid, useMediaQuery, useTheme } from "@mui/material";
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
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const [store, setStore] = useState<StoreDto | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [mobileView, setMobileView] = useState<"cart" | "products">("cart");
  const isMdOnly = useMediaQuery(theme.breakpoints.only("md"));

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
      {/* Tab Bar Row */}
      <Grid size={12} sx={{ flexShrink: 0 }}>
        <OrderTabBar />
      </Grid>

      {/* Main Content Row */}
      <Grid size={12} sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Grid container spacing={1} sx={{ height: 1 }}>
          {/* Left Panel */}
          {(!isMdOnly || mobileView === "cart") && (
            <Grid
              size={isMdOnly ? 12 : { xs: 12, sm: 12, md: 5, lg: 4, xl: 3 }}
              sx={{
                borderRight: { xs: 0, md: 1 },
                borderColor: "divider",
                bgcolor: "background.paper",
                height: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Scrollable Cart Area - Takes remaining space */}
              <Grid
                size={12}
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  overflowX: "hidden",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <OrderCart currency={store?.currency} />
              </Grid>

              {/* Browse Products Button - Only visible on md breakpoint */}
              {isMdOnly && (
                <Grid size={12} sx={{ flexShrink: 0, px: 2, pb: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => setMobileView("products")}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                  >
                    Browse Products
                  </Button>
                </Grid>
              )}

              {/* Fixed Totals */}
              <Grid size={12} sx={{ flexShrink: 0 }}>
                <OrderTotals currency={store?.currency} />
              </Grid>

              {/* Fixed Actions */}
              <Grid size={12} sx={{ flexShrink: 0 }}>
                <OrderActions
                  storeId={store?.id ?? ""}
                  currency={store?.currency}
                />
              </Grid>
            </Grid>
          )}

          {/* Right Panel */}
          {(!isMdOnly || mobileView === "products") && (
            <Grid
              size={isMdOnly ? 12 : { xs: 12, sm: 12, md: 7, lg: 8, xl: 9 }}
              sx={{
                height: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Done Button - Only visible on md breakpoint */}
              {isMdOnly && (
                <Grid
                  size={12}
                  sx={{
                    flexShrink: 0,
                    p: 2,
                    bgcolor: "background.paper",
                    borderBottom: 1,
                    borderColor: "divider",
                  }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<CheckIcon />}
                    onClick={() => setMobileView("cart")}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                  >
                    Done
                  </Button>
                </Grid>
              )}

              {/* Categories Section - ~30% of available space */}
              <Grid
                size={12}
                sx={{
                  flex: "0 0 auto",
                  minHeight: "180px",
                  maxHeight: "30vh",
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

              {/* Products Section - Takes remaining space */}
              <Grid
                size={12}
                sx={{
                  flex: 1,
                  minHeight: 0,
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
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};
