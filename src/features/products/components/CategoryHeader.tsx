import { Edit } from "@mui/icons-material";
import { Card, Grid, Typography } from "@mui/material";
import { useState } from "react";
import { container } from "tsyringe";
import { TouchButton } from "../../../components/common/TouchButton";
import { UpdateCategoryDTO } from "../schemas/update-category.schema";
import { ProductsService } from "../services/products.service";
import { CategoryDTO } from "../types/category.dto";
import { EditCategoryForm } from "./EditCategoryForm";

const productsService = container.resolve(ProductsService);

interface CategoryHeaderProps {
  category: CategoryDTO;
  onCategoryUpdated: () => void;
}

export const CategoryHeader = ({
  category,
  onCategoryUpdated,
}: CategoryHeaderProps) => {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleUpdateCategory = async (data: UpdateCategoryDTO) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await productsService.updateCategory(data);
      setEditModalOpen(false);
      onCategoryUpdated();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update category.";
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Grid size={{ xs: 12 }} sx={{ mb: 2 }}>
        <Card sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 9, md: 10 }}>
              <Typography variant="h5" fontWeight={600}>
                {category.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Category
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 3, md: 2 }}>
              <TouchButton
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => setEditModalOpen(true)}
                startIcon={<Edit />}
              >
                Edit
              </TouchButton>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      <EditCategoryForm
        open={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleUpdateCategory}
        isLoading={isSubmitting}
        error={submitError}
        category={category}
      />
    </>
  );
};
