import { TrendingUp as StatsIcon } from "@mui/icons-material";
import { Grid, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { InfoCard } from "../../../../components/cards/InfoCard";
import { formatCurrency } from "../../../products/utils/pricing";
import { CustomerDTO } from "../../types/customer.dto";

interface CustomerDetailsStatsProps {
  customer: CustomerDTO;
  currency?: string;
}

export const CustomerDetailsStats = ({
  customer,
  currency = "EGP",
}: CustomerDetailsStatsProps) => {
  const theme = useTheme();

  const StatRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <Grid container>
      <Grid size="grow">
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          {label}
        </Typography>
      </Grid>
      <Grid size="auto">
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          {value}
        </Typography>
      </Grid>
    </Grid>
  );

  return (
    <InfoCard
      title="Customer Statistics"
      icon={<StatsIcon sx={{ fontSize: 32 }} />}
      iconColor={theme.palette.success.main}
      backgroundColor="paper"
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <StatRow
            label="Total Spent"
            value={formatCurrency(customer.totalSpent || 0, currency)}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <StatRow label="Total Visits" value={customer.totalVisits || 0} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <StatRow
            label="Average Order Value"
            value={formatCurrency(customer.averageOrderValue || 0, currency)}
          />
        </Grid>

        {customer.lastVisitAt && (
          <Grid size={{ xs: 12 }}>
            <StatRow
              label="Last Visit"
              value={dayjs(customer.lastVisitAt).format("MMMM D, YYYY")}
            />
          </Grid>
        )}
      </Grid>
    </InfoCard>
  );
};
