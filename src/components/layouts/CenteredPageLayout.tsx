import { Container, Grid } from "@mui/material";
import { ReactNode } from "react";

export interface CenteredPageLayoutProps {
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * Centered page layout for auth pages and other centered content
 * Vertically and horizontally centers content on the page
 */
export const CenteredPageLayout = ({
  children,
  maxWidth = "sm",
}: CenteredPageLayoutProps) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        height: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 2,
      }}
    >
      <Grid container spacing={1} sx={{ width: 1, height: 1 }}>
        {children}
      </Grid>
    </Container>
  );
};
