import { CircularProgress, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { StoreDto } from "../../stores/types";
import { productsRepository } from "../repositories/products.repository";
import { CategoryDTO } from "../types/category.dto";
import { VariantDetailDTO } from "../types/variant-detail.dto";
import { CategoryHeader } from "./CategoryHeader";
import { ProductSearch } from "./ProductSearch";
import { VariantListItem } from "./VariantListItem";

const LIMIT = 20;

interface ProductListProps {
  category: CategoryDTO;
  store: StoreDto;
}

export const ProductList = ({ category, store }: ProductListProps) => {
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
      const updatedCategory = await productsRepository.getCategoryById(
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
        const fetchedVariants = await productsRepository.getVariantsByCategory(
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

  useEffect(() => {
    fetchVariants(searchTerm, 0);
  }, [searchTerm, fetchVariants]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchVariants(searchTerm, variants.length);
    }
  };

  return (
    <Grid container spacing={2}>
      <CategoryHeader
        category={currentCategory}
        onCategoryUpdated={handleCategoryUpdated}
      />

      <Grid size={{ xs: 12 }} sx={{ mb: 2 }}>
        <ProductSearch
          onSearch={setSearchTerm}
          placeholder="Search products..."
        />
      </Grid>

      {loading && variants.length === 0 ? (
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ p: 4 }}
        >
          <CircularProgress />
        </Grid>
      ) : error ? (
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ p: 4 }}
        >
          <Typography color="error">{error}</Typography>
        </Grid>
      ) : (
        <Grid
          id="scrollableDiv"
          size={{ xs: 12 }}
          sx={{ height: 1, overflow: "auto" }}
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
              <Typography sx={{ textAlign: "center", p: 2 }}>
                No more products to show.
              </Typography>
            }
            scrollableTarget="scrollableDiv"
          >
            <Grid container spacing={2} sx={{ p: 0.25 }}>
              {variants.map((variant) => (
                <VariantListItem
                  key={variant.id}
                  variant={variant}
                  store={store}
                />
              ))}
            </Grid>
          </InfiniteScroll>
        </Grid>
      )}
    </Grid>
  );
};
