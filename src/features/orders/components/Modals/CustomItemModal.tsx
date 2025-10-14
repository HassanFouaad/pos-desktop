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
import { z } from "zod";
import { ResponsiveDialog } from "../../../../components/common/ResponsiveDialog";
import { TouchButton } from "../../../../components/common/TouchButton";

const customItemSchema = z.object({
  variantName: z.string().min(1, "Item name is required"),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export type CustomItemFormData = z.infer<typeof customItemSchema>;

interface CustomItemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CustomItemFormData) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const CustomItemModal = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  error = null,
}: CustomItemModalProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomItemFormData>({
    resolver: zodResolver(customItemSchema),
    defaultValues: {
      variantName: "",
      price: 0,
      quantity: 1,
    },
  });

  const handleFormSubmit = (data: CustomItemFormData) => {
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
          Add Custom Item
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
                "Add Item"
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
          {/* Item Name */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="variantName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Item Name"
                  variant="outlined"
                  fullWidth
                  error={!!errors.variantName}
                  helperText={errors.variantName?.message}
                />
              )}
            />
          </Grid>

          {/* Price */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Price"
                  variant="outlined"
                  fullWidth
                  type="number"
                  error={!!errors.price}
                  helperText={errors.price?.message}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              )}
            />
          </Grid>

          {/* Quantity */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Quantity"
                  variant="outlined"
                  fullWidth
                  type="number"
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  inputProps={{ min: 1, step: 1 }}
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
};
