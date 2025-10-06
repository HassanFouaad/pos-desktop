import { Container, Grid, Typography } from "@mui/material";
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
    <Container
      maxWidth={maxWidth}
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        py: 2,
      }}
    >
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {/* Header */}
        {title && (
          <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
            <Typography variant="h4">{title}</Typography>
          </Grid>
        )}

        {/* Main Content Area */}
        <Grid size={{ xs: 12 }} sx={{ flexGrow: 1 }}>
          {children}
        </Grid>

        {/* Footer Section */}
        {footer && <Grid size={{ xs: 12 }}>{footer}</Grid>}
      </Grid>
    </Container>
  );
};
