import { ShoppingCart as ProductIcon } from "@mui/icons-material";
import { CircularProgress, Grid, Typography, useTheme } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { ActionCard } from "../../../../components/cards/ActionCard";
import { useAppDispatch } from "../../../../store/hooks";
import { addCartItem } from "../../../../store/orderSlice";

import { container } from "tsyringe";
import { OrderItemStockType } from "../../../../db/enums";
import { ProductsService } from "../../../products/services";
import type { VariantDetailDTO } from "../../../products/types/variant-detail.dto";
import { formatCurrency } from "../../../products/utils/pricing";
import { StoreDto } from "../../../stores/types";
const LIMIT = 20;

interface ProductGridProps {
  categoryId?: string | null;
  storeId: string;
  store: StoreDto;
}

const productsService = container.resolve(ProductsService);

export const ProductGrid = ({
  categoryId,
  storeId,
  store,
}: ProductGridProps) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [variantList, setVariantList] = useState<VariantDetailDTO[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadVariants = useCallback(
    async (offset: number) => {
      if (!categoryId) {
        setVariantList([]);
        return;
      }

      setLoading(true);
      try {
        const variants = await productsService.getVariantsByCategory(
          categoryId,
          storeId,
          undefined, // searchTerm
          LIMIT,
          offset
        );

        setVariantList((prev) =>
          offset === 0 ? variants : [...prev, ...variants]
        );
        setHasMore(variants.length === LIMIT);
      } catch (error) {
        console.error("Failed to load variants:", error);
      } finally {
        setLoading(false);
      }
    },
    [categoryId, storeId]
  );

  useEffect(() => {
    setVariantList([]);
    setHasMore(true);
    loadVariants(0);
  }, [categoryId, storeId, loadVariants]);

  const loadMore = () => {
    if (!loading && hasMore) {
      loadVariants(variantList.length);
    }
  };

  const handleVariantClick = (variant: VariantDetailDTO) => {
    dispatch(
      addCartItem({
        variantId: variant.id,
        quantity: 1,
        stockType: OrderItemStockType.INVENTORY,
      })
    );
  };

  if (!categoryId) {
    return (
      <Grid container sx={{ minHeight: 200 }}>
        <Grid size={12} sx={{ textAlign: "center", p: 4 }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.disabled,
            }}
          >
            Select a category to view products
          </Typography>
        </Grid>
      </Grid>
    );
  }

  if (loading && variantList.length === 0) {
    return (
      <Grid container sx={{ minHeight: 200 }}>
        <Grid size={12} sx={{ textAlign: "center", p: 4 }}>
          <CircularProgress />
        </Grid>
      </Grid>
    );
  }

  if (variantList.length === 0 && !loading) {
    return (
      <Grid container sx={{ minHeight: 200 }}>
        <Grid size={12} sx={{ textAlign: "center", p: 4 }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.disabled,
            }}
          >
            No products in this category
          </Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <InfiniteScroll
      dataLength={variantList.length}
      next={loadMore}
      hasMore={hasMore}
      loader={
        <Grid container>
          <Grid size={12} sx={{ textAlign: "center", p: 2 }}>
            <CircularProgress />
          </Grid>
        </Grid>
      }
      endMessage={
        <Grid container>
          <Grid size={12}>
            <Typography
              sx={{ textAlign: "center", p: 2, color: "text.secondary" }}
            >
              No more products
            </Typography>
          </Grid>
        </Grid>
      }
      scrollableTarget="productScrollContainer"
      style={{ overflow: "visible", width: "100%" }}
    >
      <Grid container spacing={1} sx={{ p: 1.5 }}>
        {variantList.map((variant) => (
          <ActionCard
            key={variant.id}
            title={variant?.name || "Unknown Product"}
            subtitle={`${variant.product?.name} - ${formatCurrency(
              variant.baseSellingPrice,
              store.currency
            )}`}
            icon={<ProductIcon sx={{ fontSize: 32 }} />}
            iconColor={theme.palette.primary.main}
            onClick={() => handleVariantClick(variant)}
            disabled={(variant.inventory?.quantityAvailable || 0) === 0}
            gridSize={{ xs: 6, sm: 4, md: 3, lg: 3, xl: 2 }}
          />
        ))}
      </Grid>
    </InfiniteScroll>
  );
};
