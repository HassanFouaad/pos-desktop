import {
  Event,
  MonetizationOn,
  Phone,
  Repeat,
  Stars,
  TrendingUp,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardActionArea,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";
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
  <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
    <Tooltip title={label}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          color: "text.secondary",
        }}
      >
        {icon}
        <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500 }} noWrap>
          {value || "N/A"}
        </Typography>
      </Box>
    </Tooltip>
  </Grid>
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

  const cardContent = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" fontWeight={600}>
          {customer.name}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={1.5}>
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
      </Grid>
    </Grid>
  );

  return (
    <Grid size={{ xs: 12 }}>
      <Card sx={{ p: 2 }}>
        {onClick ? (
          <CardActionArea onClick={handleClick}>{cardContent}</CardActionArea>
        ) : (
          cardContent
        )}
      </Card>
    </Grid>
  );
};
