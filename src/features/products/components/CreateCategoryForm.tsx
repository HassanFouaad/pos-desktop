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
import { Controller, useForm } from "react-hook-form";
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
              Create New Category
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
                      "Create Category"
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
