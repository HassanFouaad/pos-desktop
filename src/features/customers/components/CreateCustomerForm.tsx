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
  CreateCustomerDTO,
  createCustomerSchema,
} from "../schemas/create-customer.schema";
import { PhoneNumberInput } from "./PhoneNumberInput";

interface CreateCustomerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerDTO) => void;
  isLoading: boolean;
  error: string | null;
}

export function CreateCustomerForm({
  open,
  onClose,
  onSubmit,
  isLoading,
  error,
}: CreateCustomerFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCustomerDTO>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: { name: "", phone: "+20" },
  });

  const handleFormSubmit = (data: CreateCustomerDTO) => {
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
          Create New Customer
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
                  label="Customer Name (Optional)"
                  variant="outlined"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneNumberInput
                  label="Phone Number"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
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
