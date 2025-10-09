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

  return (
    <Grid container rowSpacing={1} size={12} direction="column">
      <Grid size={12}>
        <OrderTabBar />
      </Grid>

      <Grid
        size={12}
        container
        sx={{ overflow: "hidden", flex: 1 }}
        spacing={1}
      >
        {/* Left Panel */}
        <Grid
          sx={{
            borderRight: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
          direction="column"
          display="flex"
          size={{ xs: 12, md: 5, lg: 4 }}
          container
        >
          <Grid size={12}>
            <OrderCart />
          </Grid>

          <Grid size={12}>
            <OrderTotals />
          </Grid>

          <Grid size={12}>
            <OrderActions storeId={store?.id ?? ""} />
          </Grid>
        </Grid>

        {/* Right Panel */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }} container direction="column">
          <Grid
            size={{ xs: 12 }}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              p: 2,
              overflow: "auto",
              maxHeight: "30vh",
            }}
          >
            <CategoryGrid onCategorySelect={setSelectedCategoryId} />
          </Grid>
          <Grid size={{ xs: 12 }} sx={{ flex: 1, overflow: "auto" }}>
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
  );
};
