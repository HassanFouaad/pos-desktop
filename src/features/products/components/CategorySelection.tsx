import { Add, Category } from "@mui/icons-material";
import { CircularProgress, Grid } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { container } from "tsyringe";
import { ActionCard } from "../../../components/cards/ActionCard";
import { TouchButton } from "../../../components/common/TouchButton";
import { CreateCategoryDTO } from "../schemas/create-category.schema";
import { ProductsService } from "../services/products.service";
import { CategoryDTO } from "../types/category.dto";
import { CreateCategoryForm } from "./CreateCategoryForm";
import { ProductSearch } from "./ProductSearch";

const productsService = container.resolve(ProductsService);

export const CategorySelection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (search: string) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCategories = await productsService.getCategories(search);
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
      await productsService.createCategory(data);
      setCreateModalOpen(false);
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
    <Grid
      container
      sx={{
        height: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Search and Add Button - Fixed */}
      <Grid size={12} sx={{ flexShrink: 0 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 9, md: 10 }}>
            <ProductSearch
              onSearch={setSearchTerm}
              placeholder="Search categories..."
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3, md: 2 }}>
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
        </Grid>
      </Grid>

      {/* Scrollable Categories List - Takes remaining space */}
      <Grid
        size={12}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          pt: 2,
        }}
      >
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
          <Grid container spacing={1}>
            {categories.map((category) => (
              <ActionCard
                key={category.id}
                title={category.name ?? "Unnamed Category"}
                icon={<Category />}
                onClick={() => navigate(`/products/${category.id}`)}
                gridSize={{ xs: 12, sm: 12, md: 4, lg: 2 }}
              />
            ))}
          </Grid>
        )}
      </Grid>

      <CreateCategoryForm
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateCategory}
        isLoading={isSubmitting}
        error={submitError}
      />
    </Grid>
  );
};
