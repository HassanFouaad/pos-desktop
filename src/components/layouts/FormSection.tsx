import { Grid, Typography } from "@mui/material";
import { FormEvent, ReactNode } from "react";

export interface FormSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  spacing?: number;
}

/**
 * Form section component optimized for form layouts
 * Provides consistent spacing and form handling
 */
export const FormSection = ({
  children,
  title,
  subtitle,
  onSubmit,
  spacing = 3,
}: FormSectionProps) => {
  return (
    <Grid
      component="form"
      container
      spacing={spacing}
      onSubmit={onSubmit}
      noValidate
    >
      {/* Form Header */}
      {(title || subtitle) && (
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={1}>
            {title && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="h5" component="h2">
                  {title}
                </Typography>
              </Grid>
            )}
            {subtitle && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      )}

      {/* Form Content */}
      {children}
    </Grid>
  );
};
