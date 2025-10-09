import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={{ xs: true, md: true, lg: false }}
    >
      <DialogContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
            <Typography variant="h4" component="h2" fontWeight={700}>
              Edit Category
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
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
                <Grid size={{ xs: 12 }}>
                  <TouchButton
                    type="submit"
                    size="large"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Update Category"
                    )}
                  </TouchButton>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
