import { Edit } from "@mui/icons-material";
import { Alert, Card, Grid, Snackbar, Typography } from "@mui/material";
import { useState } from "react";
import { TouchButton } from "../../../components/common/TouchButton";
import { categoriesRepository } from "../repositories/categories.repository";
import { UpdateCategoryDTO } from "../schemas/update-category.schema";
import { CategoryDTO } from "../types/category.dto";
import { EditCategoryForm } from "./EditCategoryForm";

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleUpdateCategory = async (data: UpdateCategoryDTO) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await categoriesRepository.updateCategory(data);
      setEditModalOpen(false);
      setSnackbarOpen(true);
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
          Category updated successfully
        </Alert>
      </Snackbar>
    </>
  );
};
