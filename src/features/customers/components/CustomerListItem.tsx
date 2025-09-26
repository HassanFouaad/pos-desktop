import {
  Event,
  MonetizationOn,
  Phone,
  Repeat,
  Stars,
  TrendingUp,
} from "@mui/icons-material";
import { Box, Grid, Paper, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { formatCurrency } from "../../products/utils/pricing";
import { CustomerDTO } from "../types/customer.dto";

interface CustomerListItemProps {
  customer: CustomerDTO;
  onClick?: (customer: CustomerDTO) => void;
}

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}) => (
  <Tooltip title={`${label}: ${value}`}>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mr: 2,
        flexShrink: 0,
        color: "text.secondary",
      }}
    >
      {icon}
      <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500 }}>
        {value || "N/A"}
      </Typography>
    </Box>
  </Tooltip>
);

export const CustomerListItem = ({
  customer,
  onClick,
}: CustomerListItemProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(customer);
    }
  };

  return (
    <Grid size={{ xs: 12 }}>
      <Paper
        onClick={handleClick}
        sx={{
          p: 2,
          width: 1,
          cursor: onClick ? "pointer" : "default",
          "&:active": {
            transform: onClick ? "scale(0.99)" : "none",
          },
        }}
      >
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6">{customer.name}</Typography>
          </Grid>
        </Grid>
        <Grid
          container
          sx={{
            mt: 1.5,
            pt: 1,
            borderTop: 1,
            borderColor: "divider",
            flexWrap: "nowrap",
            overflowX: "auto",
            pb: 1,
          }}
        >
          <DetailItem
            icon={<Phone sx={{ fontSize: 18 }} />}
            label="Phone"
            value={customer.phone}
          />
          <DetailItem
            icon={<Stars sx={{ fontSize: 18 }} />}
            label="Loyalty Points"
            value={`${customer.loyaltyPoints || 0} pts`}
          />
          <DetailItem
            icon={<MonetizationOn sx={{ fontSize: 18 }} />}
            label="Total Spent"
            value={formatCurrency(customer.totalSpent, "EGP")}
          />
          <DetailItem
            icon={<Repeat sx={{ fontSize: 18 }} />}
            label="Total Visits"
            value={customer.totalVisits}
          />
          <DetailItem
            icon={<TrendingUp sx={{ fontSize: 18 }} />}
            label="Avg. Order Value"
            value={formatCurrency(customer.averageOrderValue, "EGP")}
          />
          <DetailItem
            icon={<Event sx={{ fontSize: 18 }} />}
            label="Last Visit"
            value={
              customer.lastVisitAt
                ? dayjs(customer.lastVisitAt).format("MMM D, YYYY")
                : "N/A"
            }
          />
        </Grid>
      </Paper>
    </Grid>
  );
};
