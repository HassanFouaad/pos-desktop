import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import {
  Alert,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { TouchButton } from "../../../components/common/TouchButton";
import { CenteredPageLayout } from "../../../components/layouts/CenteredPageLayout";
import { FormSection } from "../../../components/layouts/FormSection";
import { LoginCredentials, loginSchema } from "../api/auth";

interface LoginFormProps {
  onSubmit: (data: LoginCredentials) => void;
  isLoading: boolean;
  error: string | null;
  onBack?: () => void;
}

export function LoginForm({
  onSubmit,
  isLoading,
  error,
  onBack,
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <CenteredPageLayout>
      {/* Header */}
      <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Sign In
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Enter your credentials to continue
        </Typography>
      </Grid>

      {/* Form */}
      <Grid size={{ xs: 12 }}>
        <FormSection onSubmit={handleSubmit(onSubmit)}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              id="username"
              label="Username"
              autoComplete="username"
              {...register("username")}
              error={!!errors.username}
              helperText={errors.username?.message}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
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
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </TouchButton>
          </Grid>

          {onBack && (
            <Grid size={{ xs: 12 }}>
              <TouchButton
                type="button"
                size="large"
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={onBack}
                disabled={isLoading}
                startIcon={<ArrowBackIcon />}
              >
                Back to Device Info
              </TouchButton>
            </Grid>
          )}
        </FormSection>
      </Grid>
    </CenteredPageLayout>
  );
}
