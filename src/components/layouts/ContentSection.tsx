import { Box, Grid, Typography } from "@mui/material";
import { ReactNode } from "react";

export interface ContentSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  spacing?: number;
  backgroundColor?: "default" | "paper" | "section";
  padding?: number;
}

/**
 * Content section component for organizing page content
 * Provides consistent spacing and optional title
 */
export const ContentSection = ({
  children,
  title,
  subtitle,
  spacing = 2,
  backgroundColor = "default",
  padding,
}: ContentSectionProps) => {
  const getBgColor = () => {
    switch (backgroundColor) {
      case "paper":
        return "background.paper";
      case "section":
        return "background.section";
      default:
        return "background.default";
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: getBgColor(),
        borderRadius: (theme) => theme.customShape.borderRadiusLarge,
        p: padding !== undefined ? padding : 2,
      }}
    >
      <Grid container spacing={spacing}>
        {/* Section Header */}
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

        {/* Section Content */}
        <Grid size={{ xs: 12 }}>{children}</Grid>
      </Grid>
    </Box>
  );
};
