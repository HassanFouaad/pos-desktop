import { Add, Category } from "@mui/icons-material";
import { Alert, CircularProgress, Grid, Snackbar } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActionCard } from "../../../components/cards/ActionCard";
import { TouchButton } from "../../../components/common/TouchButton";
import { categoriesRepository } from "../repositories/categories.repository";
import { productsRepository } from "../repositories/products.repository";
import { CreateCategoryDTO } from "../schemas/create-category.schema";
import { CategoryDTO } from "../types/category.dto";
import { CreateCategoryForm } from "./CreateCategoryForm";
import { ProductSearch } from "./ProductSearch";

export const CategorySelection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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

  const handleCreateCategory = async (data: CreateCategoryDTO) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await categoriesRepository.createCategory(data);
      setCreateModalOpen(false);
      setSnackbarOpen(true);
      fetchCategories(searchTerm);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create category.";
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ p: 4 }}>
        <p>{error}</p>
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 9, md: 10 }} sx={{ mb: 2 }}>
        <ProductSearch
          onSearch={setSearchTerm}
          placeholder="Search categories..."
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 3, md: 2 }} sx={{ mb: 2 }}>
        <TouchButton
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => setCreateModalOpen(true)}
          startIcon={<Add />}
        >
          New
        </TouchButton>
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
          <ActionCard
            key={category.id}
            title={category.name ?? "Unnamed Category"}
            icon={<Category />}
            onClick={() => navigate(`/products/${category.id}`)}
            gridSize={{ xs: 12, sm: 12, md: 4, lg: 2 }}
          />
        ))
      )}
      <CreateCategoryForm
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateCategory}
        isLoading={isSubmitting}
        error={submitError}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Category created successfully
        </Alert>
      </Snackbar>
    </Grid>
  );
};
