import { CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { container } from "tsyringe";
import { StoresService } from "../../stores/services/stores.service";
import { StoreDto } from "../../stores/types";
import { ProductList } from "../components/ProductList";
import { ProductsService } from "../services/products.service";
import { CategoryDTO } from "../types/category.dto";

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

  return <ProductList category={category} store={store} />;
};

export default ProductListPage;
