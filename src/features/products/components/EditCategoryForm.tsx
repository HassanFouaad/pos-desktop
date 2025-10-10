import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ResponsiveDialog } from "../../../components/common/ResponsiveDialog";
import { TouchButton } from "../../../components/common/TouchButton";
import {
  UpdateCategoryDTO,
  updateCategorySchema,
} from "../schemas/update-category.schema";
import { CategoryDTO } from "../types/category.dto";

interface EditCategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateCategoryDTO) => void;
  isLoading: boolean;
  error: string | null;
  category: CategoryDTO;
}

export function EditCategoryForm({
  open,
  onClose,
  onSubmit,
  isLoading,
  error,
  category,
}: EditCategoryFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateCategoryDTO>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      id: category.id,
      name: category.name ?? "",
    },
  });

  // Update form when category changes
  useEffect(() => {
    reset({
      id: category.id,
      name: category.name ?? "",
    });
  }, [category, reset]);

  const handleFormSubmit = (data: UpdateCategoryDTO) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset({
      id: category.id,
      name: category.name ?? "",
    });
    onClose();
  };

  return (
    <ResponsiveDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      title={
        <Typography variant="h4" component="h2" fontWeight={700}>
          Edit Category
        </Typography>
      }
      actions={
        <Grid container spacing={2} sx={{ width: 1 }}>
          <Grid size={{ xs: 6 }}>
            <TouchButton
              fullWidth
              variant="outlined"
              onClick={handleClose}
              disabled={isLoading}
              size="large"
            >
              Cancel
            </TouchButton>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TouchButton
              fullWidth
              type="submit"
              size="large"
              variant="contained"
              disabled={isLoading}
              onClick={handleSubmit(handleFormSubmit)}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Update"
              )}
            </TouchButton>
          </Grid>
        </Grid>
      }
    >
      <Box
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        noValidate
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Category Name"
                  variant="outlined"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>
          {error && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </Grid>
      </Box>
    </ResponsiveDialog>
  );
}
