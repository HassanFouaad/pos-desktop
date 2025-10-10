import { Card, Grid, Skeleton } from "@mui/material";

export const CustomerSkeleton = () => {
  return (
    <Grid size={{ xs: 12 }}>
      <Card sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Customer Name */}
          <Grid size={{ xs: 12 }}>
            <Skeleton variant="text" width="40%" height={32} />
          </Grid>

          {/* Customer Details */}
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
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <Skeleton variant="text" width="100%" height={24} />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <Skeleton variant="text" width="100%" height={24} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
};
