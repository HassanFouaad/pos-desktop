import { Container, Grid, Typography } from "@mui/material";
import { ReactNode } from "react";

export interface GridLayoutProps {
  children: ReactNode;
  title?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  spacing?: number;
  footer?: ReactNode;
}

/**
 * Main grid-based layout for the application
 * Handles responsive behavior automatically through MUI Grid
 */
export const GridLayout = ({
  children,
  maxWidth = "xl",
  spacing = 2,
  footer,
  title,
}: GridLayoutProps) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        height: 1,
        overflow: "hidden",
        width: 1,
        py: 2,
      }}
    >
      <Grid container sx={{ height: 1, width: 1 }}>
        <Grid
          size={{ xs: 12 }}
          sx={{ justifyContent: "center", textAlign: "center", py: 1 }}
        >
          <Typography variant="h4">{title}</Typography>
        </Grid>
        {/* Main Content Area - scrollable */}
        <Grid size={{ xs: 12 }}>
          <Grid spacing={spacing} sx={{ p: 2 }}>
            {children}
          </Grid>
        </Grid>

        {/* Footer Section - fixed at bottom */}
        {footer && (
          <Grid
            component="div"
            size={{ xs: 12 }}
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: "background.default",
              zIndex: 10,
            }}
          >
            {footer}
          </Grid>
        )}
      </Grid>
    </Container>
  );
};
