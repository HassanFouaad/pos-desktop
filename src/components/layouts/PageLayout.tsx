import { Container, Grid, Typography } from "@mui/material";
import { ReactNode } from "react";

export interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  footer?: ReactNode;
  headerActions?: ReactNode;
}

/**
 * Main page layout for the application
 * Provides consistent structure with header, scrollable content, and optional footer
 */
export const PageLayout = ({
  children,
  title,
  maxWidth = "xl",
  footer,
  headerActions,
}: PageLayoutProps) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        py: 2,
      }}
    >
      <Grid container spacing={2} sx={{ flexGrow: 1, overflow: "hidden" }}>
        {/* Header Section */}
        {(title || headerActions) && (
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2} alignItems="center">
              {title && (
                <Grid size={{ xs: headerActions ? 8 : 12 }}>
                  <Typography variant="h4" component="h1">
                    {title}
                  </Typography>
                </Grid>
              )}
              {headerActions && (
                <Grid
                  size={{ xs: title ? 4 : 12 }}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  {headerActions}
                </Grid>
              )}
            </Grid>
          </Grid>
        )}

        {/* Scrollable Content Area */}
        <Grid
          size={{ xs: 12 }}
          sx={{
            flexGrow: 1,
            overflow: "auto",
          }}
        >
          {children}
        </Grid>

        {/* Footer Section */}
        {footer && <Grid size={{ xs: 12 }}>{footer}</Grid>}
      </Grid>
    </Container>
  );
};
