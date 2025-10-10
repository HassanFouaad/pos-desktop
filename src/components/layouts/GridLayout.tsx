import { Grid, Typography } from "@mui/material";
import { ReactNode } from "react";

export interface GridLayoutProps {
  children: ReactNode;
  title?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  footer?: ReactNode;
}

/**
 * Main grid-based layout for the application
 * Handles responsive behavior automatically through
 * All styling handled by theme
 */
export const GridLayout = ({
  children,
  maxWidth = "xl",
  footer,
  title,
}: GridLayoutProps) => {
  return (
    <Grid container spacing={2} sx={{ height: "100vh", p: 1 }}>
      {/* Header */}
      {title && (
        <Grid size={12} sx={{ textAlign: "center" }}>
          <Typography variant="h4">{title}</Typography>
        </Grid>
      )}

      {/* Main Content Area */}
      <Grid
        size={12}
        sx={{
          height: 1,
          overflow: "hidden",
        }}
      >
        {children}
      </Grid>

      {/* Footer Section */}
      {footer && <Grid size={12}>{footer}</Grid>}
    </Grid>
  );
};
