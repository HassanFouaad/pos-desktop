import { Card, Grid, Skeleton } from "@mui/material";

export const OrderSkeleton = () => {
  return (
    <Grid size={{ xs: 12 }}>
      <Card sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Header */}
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid size="grow">
                <Skeleton variant="text" width="60%" height={32} />
              </Grid>
              <Grid size="auto">
                <Skeleton variant="rounded" width={80} height={24} />
              </Grid>
            </Grid>
          </Grid>

          {/* Order Details */}
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <Skeleton variant="text" width="100%" height={24} />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <Skeleton variant="text" width="100%" height={24} />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <Skeleton variant="text" width="100%" height={24} />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <Skeleton variant="text" width="100%" height={24} />
              </Grid>
            </Grid>
          </Grid>

          {/* Payment Info */}
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid size="auto">
                <Skeleton variant="rounded" width={100} height={24} />
              </Grid>
              <Grid size="auto">
                <Skeleton variant="rounded" width={80} height={24} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
};
