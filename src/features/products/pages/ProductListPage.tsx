import { CircularProgress, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { container } from "tsyringe";
import { StoresService } from "../../stores/services/stores.service";
import { StoreDto } from "../../stores/types";
import { ProductList } from "../components/ProductList";
import { ProductsService } from "../services/products.service";
import { CategoryDTO } from "../types/category.dto";
import { VariantDetailDTO } from "../types/variant-detail.dto";

const productsService = container.resolve(ProductsService);
const storesService = container.resolve(StoresService);

const ProductListPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<CategoryDTO | null>(null);
  const [store, setStore] = useState<StoreDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) {
        setError("Category ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [fetchedCategory, currentStore] = await Promise.all([
          productsService.getCategoryById(categoryId),
          storesService.getCurrentStore(),
        ]);

        if (!fetchedCategory) {
          setError("Category not found");
          setLoading(false);
          return;
        }

        setCategory(fetchedCategory);
        setStore(currentStore);
      } catch (err) {
        setError("Failed to load category or store information");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  const handleVariantClick = useCallback((variant: VariantDetailDTO) => {
    // TODO: Implement action when variant is clicked
    // For example: Add to cart, navigate to details, open modal, etc.
    console.log("Variant clicked:", variant);
  }, []);

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ p: 4 }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ p: 4 }}>
        <Typography color="error">{error}</Typography>
      </Grid>
    );
  }

  if (!category || !store) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ p: 4 }}>
        <Typography color="error">
          Unable to load category or store information
        </Typography>
      </Grid>
    );
  }

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
      <Grid size={12} sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <ProductList
          category={category}
          store={store}
          onVariantClick={handleVariantClick}
        />
      </Grid>
    </Grid>
  );
};

export default ProductListPage;
