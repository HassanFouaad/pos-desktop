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
  maxWidth: _maxWidth = "xl",
  footer,
  title,
}: GridLayoutProps) => {
  return (
    <Grid
      container
      sx={{
        height: "100vh",
        p: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      {title && (
        <Grid size={12} sx={{ flexShrink: 0, textAlign: "center", pb: 2 }}>
          <Typography variant="h4">{title}</Typography>
        </Grid>
      )}

      {/* Main Content Area */}
      <Grid
        size={12}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {children}
      </Grid>

      {/* Footer Section */}
      {footer && (
        <Grid size={12} sx={{ flexShrink: 0 }}>
          {footer}
        </Grid>
      )}
    </Grid>
  );
};
