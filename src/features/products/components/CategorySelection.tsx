import { Category } from "@mui/icons-material";
import { CircularProgress, Grid } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { GridCard } from "../../../components/common/GridCard";
import {
  CategoryDTO,
  productsRepository,
} from "../repositories/products.repository";
import { ProductSearch } from "./ProductSearch";

interface CategorySelectionProps {
  onSelectCategory: (category: CategoryDTO) => void;
}

export const CategorySelection = ({
  onSelectCategory,
}: CategorySelectionProps) => {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = useCallback(async (search: string) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCategories = await productsRepository.getCategories(search);
      setCategories(fetchedCategories);
    } catch (err) {
      setError("Failed to load categories.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories(searchTerm);
  }, [searchTerm, fetchCategories]);

  if (error) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ p: 4 }}>
        <p>{error}</p>
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }} sx={{ mb: 2 }}>
        <ProductSearch
          onSearch={setSearchTerm}
          placeholder="Search categories..."
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
      ) : (
        categories.map((category) => (
          <GridCard
            key={category.id}
            title={category.name ?? "Unnamed Category"}
            icon={<Category />}
            onClick={() => onSelectCategory(category)}
            gridProps={{ size: { xs: 12, sm: 12, md: 4, lg: 2 } }}
          />
        ))
      )}
    </Grid>
  );
};
