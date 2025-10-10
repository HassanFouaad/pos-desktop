import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { ResponsiveDialog } from "../../../components/common/ResponsiveDialog";
import { TouchButton } from "../../../components/common/TouchButton";
import {
  CreateCategoryDTO,
  createCategorySchema,
} from "../schemas/create-category.schema";

interface CreateCategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryDTO) => void;
  isLoading: boolean;
  error: string | null;
}

export function CreateCategoryForm({
  open,
  onClose,
  onSubmit,
  isLoading,
  error,
}: CreateCategoryFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCategoryDTO>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "" },
  });

  const handleFormSubmit = (data: CreateCategoryDTO) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
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
          Create New Category
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
                "Create"
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
