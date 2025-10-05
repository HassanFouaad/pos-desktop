import { zodResolver } from "@hookform/resolvers/zod";
import {
  CircularProgress,
  Container,
  Grid,
  TextField,
  Typography,
  type Theme,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { TouchButton } from "../../../components/common/TouchButton";
import { LoginCredentials, loginSchema } from "../api/auth";

interface LoginFormProps {
  onSubmit: (data: LoginCredentials) => void;
  isLoading: boolean;
  error: string | null;
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Grid container spacing={4}>
        {/* Header */}
        <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
            sx={{
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Sign In
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Enter your credentials to continue
          </Typography>
        </Grid>

        {/* Form */}
        <Grid size={{ xs: 12 }}>
          <Grid
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            container
            spacing={3}
          >
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="tenantSubDomain"
                label="Tenant Sub Domain"
                autoComplete="tenantSubDomain"
                autoFocus
                {...register("tenantSubDomain")}
                error={!!errors.tenantSubDomain}
                helperText={errors.tenantSubDomain?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="username"
                label="Username"
                autoComplete="username"
                {...register("username")}
                error={!!errors.username}
                helperText={errors.username?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {error && (
              <Grid size={{ xs: 12 }}>
                <Typography
                  color="error"
                  variant="body2"
                  sx={{
                    p: 2,
                    backgroundColor: (theme) => `${theme.palette.error.main}10`,
                    borderRadius: 2,
                    textAlign: "center",
                  }}
                >
                  {error}
                </Typography>
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
                sx={{
                  py: 3,
                  fontSize: "1.25rem",
                  background: (theme: Theme) =>
                    !isLoading
                      ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                      : undefined,
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </TouchButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
