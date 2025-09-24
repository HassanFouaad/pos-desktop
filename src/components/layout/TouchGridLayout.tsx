import { Box, useTheme } from "@mui/material";
import { ReactNode } from "react";

export interface TouchGridLayoutProps {
  children: ReactNode;
  spacing?: number;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  minHeight?: string | number;
  autoHeight?: boolean;
}

export const TouchGridLayout = ({
  children,
  spacing = 2,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  minHeight = "auto",
  autoHeight = true,
}: TouchGridLayoutProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "grid",
        gap: theme.spacing(spacing),
        gridTemplateColumns: {
          xs: `repeat(${columns.xs || 1}, 1fr)`,
          sm: `repeat(${columns.sm || 2}, 1fr)`,
          md: `repeat(${columns.md || 3}, 1fr)`,
          lg: `repeat(${columns.lg || 4}, 1fr)`,
          xl: `repeat(${columns.xl || 5}, 1fr)`,
        },
        minHeight: minHeight,
        height: autoHeight ? "auto" : "100%",
        width: "100%",
        alignContent: "start",
      }}
    >
      {children}
    </Box>
  );
};
