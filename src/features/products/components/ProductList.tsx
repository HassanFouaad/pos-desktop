import { ArrowBack } from "@mui/icons-material";
import { CircularProgress, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { TouchButton } from "../../../components/common/TouchButton";
import { StoreDTO } from "../../stores/repositories/stores.repository";
import {
  CategoryDTO,
  ProductDTO,
  productsRepository,
} from "../repositories/products.repository";
import { ProductListItem } from "./ProductListItem";
import { ProductSearch } from "./ProductSearch";

interface ProductListProps {
  category: CategoryDTO;
  onBack: () => void;
  store: StoreDTO;
}

export const ProductList = ({ category, onBack, store }: ProductListProps) => {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = useCallback(
    async (search: string) => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await productsRepository.getProducts(
          category.id,
          search
        );
        setProducts(fetchedProducts);
      } catch (err) {
        setError("Failed to load products.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [category.id]
  );

  useEffect(() => {
    fetchProducts(searchTerm);
  }, [searchTerm, fetchProducts]);

  return (
    <Grid container spacing={2}>
      <Grid
        size={{ xs: 12 }}
        sx={{ display: "flex", alignItems: "center", mb: 2 }}
      >
        <TouchButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </TouchButton>
        <Typography variant="h5" component="h2">
          {category.name}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ mb: 2 }}>
        <ProductSearch
          onSearch={setSearchTerm}
          placeholder="Search products..."
        />
      </Grid>

      {loading ? (
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
      ) : products.length === 0 ? (
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ p: 4 }}
        >
          <Typography>No products found.</Typography>
        </Grid>
      ) : (
        <Grid container spacing={2} size={{ xs: 12 }}>
          {products.map((product) => (
            <ProductListItem key={product.id} product={product} store={store} />
          ))}
        </Grid>
      )}
    </Grid>
  );
};
