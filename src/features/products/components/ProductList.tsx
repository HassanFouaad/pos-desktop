import { Inventory } from "@mui/icons-material";
import { CircularProgress, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { container } from "tsyringe";
import { StoreDto } from "../../stores/types";
import { ProductsService } from "../services/products.service";
import { CategoryDTO } from "../types/category.dto";
import { VariantDetailDTO } from "../types/variant-detail.dto";
import { formatCurrency } from "../utils/pricing";
import { CategoryHeader } from "./CategoryHeader";
import { ProductCard } from "./ProductCard";
import { ProductSearch } from "./ProductSearch";
import { ProductSkeleton } from "./ProductSkeleton";

const productsService = container.resolve(ProductsService);

const LIMIT = 20;

interface ProductListProps {
  category: CategoryDTO;
  store: StoreDto;
  onVariantClick?: (variant: VariantDetailDTO) => void;
}

export const ProductList = ({
  category,
  store,
  onVariantClick,
}: ProductListProps) => {
  const [currentCategory, setCurrentCategory] = useState<CategoryDTO>(category);
  const [variants, setVariants] = useState<VariantDetailDTO[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Update currentCategory when category prop changes
  useEffect(() => {
    setCurrentCategory(category);
  }, [category]);

  const handleCategoryUpdated = useCallback(async () => {
    try {
      const updatedCategory = await productsService.getCategoryById(
        category.id
      );
      if (updatedCategory) {
        setCurrentCategory(updatedCategory);
      }
    } catch (err) {
      console.error("Failed to refresh category:", err);
    }
  }, [category.id]);

  const fetchVariants = useCallback(
    async (search: string, offset: number) => {
      setLoading(true);
      setError(null);
      try {
        const fetchedVariants = await productsService.getVariantsByCategory(
          category.id,
          store.id,
          search,
          LIMIT,
          offset
        );
        setVariants((prev) =>
          offset === 0 ? fetchedVariants : [...prev, ...fetchedVariants]
        );
        setHasMore(fetchedVariants.length === LIMIT);
      } catch (err) {
        setError("Failed to load products.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [category.id, store.id]
  );

  const fetch = useCallback(() => {
    fetchVariants(searchTerm, 0);
  }, [searchTerm]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchVariants(searchTerm, variants.length);
    }
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
      {/* Category Header - Fixed */}
      <Grid size={12} sx={{ flexShrink: 0 }}>
        <CategoryHeader
          category={currentCategory}
          onCategoryUpdated={handleCategoryUpdated}
        />
      </Grid>

      {/* Search Bar - Fixed */}
      <Grid size={12} sx={{ flexShrink: 0, pt: 2 }}>
        <ProductSearch
          onSearch={setSearchTerm}
          placeholder="Search products..."
        />
      </Grid>

      {/* Scrollable Product List - Takes remaining space */}
      <Grid
        size={12}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          pt: 2,
        }}
      >
        {loading && variants.length === 0 ? (
          <Grid container spacing={1} sx={{ p: 2 }}>
            {[...Array(8)].map((_, index) => (
              <ProductSkeleton key={index} showInventory={true} />
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
            id="scrollableDiv"
            sx={{
              height: 1,
              overflowY: "auto",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <InfiniteScroll
              dataLength={variants.length}
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
                  No more products to show.
                </Typography>
              }
              scrollableTarget="scrollableDiv"
              style={{ overflow: "visible" }}
            >
              <Grid container spacing={1}>
                {variants.map((variant) => (
                  <ProductCard
                    key={variant.id}
                    title={variant.name || "Unnamed Variant"}
                    subtitle={variant.product?.name ?? undefined}
                    price={formatCurrency(
                      variant.baseSellingPrice,
                      store.currency || "EGP"
                    )}
                    icon={<Inventory />}
                    onClick={
                      onVariantClick ? () => onVariantClick(variant) : undefined
                    }
                    inventory={
                      variant.inventory
                        ? {
                            quantityAvailable:
                              variant.inventory.quantityAvailable,
                            quantityOnHand: variant.inventory.quantityOnHand,
                            quantityCommitted:
                              variant.inventory.quantityCommitted,
                          }
                        : undefined
                    }
                    showInventory={true}
                    gridSize={{ xs: 12, sm: 6, md: 4, lg: 3 }}
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
