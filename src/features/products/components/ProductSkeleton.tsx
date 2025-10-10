import { Card, Grid, Skeleton } from "@mui/material";

interface ProductSkeletonProps {
  gridSize?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  showInventory?: boolean;
}

export const ProductSkeleton = ({
  gridSize = { xs: 12, sm: 6, md: 4, lg: 3 },
  showInventory = false,
}: ProductSkeletonProps) => {
  return (
    <Grid size={gridSize}>
      <Card
        sx={{
          p: 2,
          height: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Icon Skeleton */}
        <Grid container justifyContent="center" sx={{ mb: 1.5 }}>
          <Skeleton variant="circular" width={32} height={32} />
        </Grid>

        {/* Title Skeleton */}
        <Skeleton
          variant="text"
          width="100%"
          height={24}
          sx={{ mb: 0.5, mx: "auto" }}
        />
        <Skeleton
          variant="text"
          width="80%"
          height={24}
          sx={{ mb: 0.5, mx: "auto" }}
        />

        {/* Subtitle Skeleton */}
        <Skeleton
          variant="text"
          width="70%"
          height={20}
          sx={{ mb: 1, mx: "auto" }}
        />

        {/* Price Skeleton */}
        <Skeleton
          variant="text"
          width="50%"
          height={32}
          sx={{ mb: showInventory ? 2 : 0, mx: "auto" }}
        />

        {/* Inventory Info Skeleton */}
        {showInventory && (
          <Grid
            container
            spacing={1}
            justifyContent="center"
            sx={{ mt: "auto" }}
          >
            <Grid>
              <Skeleton variant="rounded" width={60} height={24} />
            </Grid>
            <Grid>
              <Skeleton variant="rounded" width={60} height={24} />
            </Grid>
            <Grid>
              <Skeleton variant="rounded" width={60} height={24} />
            </Grid>
          </Grid>
        )}
      </Card>
    </Grid>
  );
};
