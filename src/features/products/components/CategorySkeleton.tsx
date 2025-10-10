import { Card, Grid, Skeleton } from "@mui/material";

interface CategorySkeletonProps {
  gridSize?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const CategorySkeleton = ({
  gridSize = { xs: 12, sm: 12, md: 4, lg: 2 },
}: CategorySkeletonProps) => {
  return (
    <Grid size={gridSize}>
      <Card
        sx={{
          p: 2,
          height: 140,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Icon Skeleton */}
        <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />

        {/* Title Skeleton */}
        <Skeleton variant="text" width="80%" height={28} />

        {/* Subtitle Skeleton (optional) */}
        <Skeleton variant="text" width="60%" height={20} />
      </Card>
    </Grid>
  );
};
