import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Typography variant="h6" component="h2">
          Create New Customer
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          sx={{ mt: 2 }}
        >
          <Grid container spacing={2}>
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
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : "Create"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
