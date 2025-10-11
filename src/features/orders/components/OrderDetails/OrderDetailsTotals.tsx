import { Calculate as CalculateIcon } from "@mui/icons-material";
import { Divider, Grid, Typography, useTheme } from "@mui/material";
import { InfoCard } from "../../../../components/cards/InfoCard";
import { formatCurrency } from "../../../products/utils/pricing";
import { OrderDto } from "../../types/order.types";

interface OrderDetailsTotalsProps {
  order: OrderDto;
  currency?: string;
}

export const OrderDetailsTotals = ({
  order,
  currency = "EGP",
}: OrderDetailsTotalsProps) => {
  const theme = useTheme();

  const TotalRow = ({
    label,
    value,
    variant = "body1",
    bold = false,
  }: {
    label: string;
    value: string;
    variant?: "body1" | "body2" | "h6";
    bold?: boolean;
  }) => (
    <Grid container>
      <Grid size="grow">
        <Typography
          variant={variant}
          sx={{
            color: "text.secondary",
            fontWeight: bold ? 600 : 400,
          }}
        >
          {label}
        </Typography>
      </Grid>
      <Grid size="auto">
        <Typography
          variant={variant}
          sx={{
            color: "text.primary",
            fontWeight: bold ? 700 : 600,
          }}
        >
          {value}
        </Typography>
      </Grid>
    </Grid>
  );

  return (
    <InfoCard
      title="Order Totals"
      icon={<CalculateIcon sx={{ fontSize: 32 }} />}
      iconColor={theme.palette.warning.main}
      backgroundColor="paper"
    >
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          {/* Subtotal */}
          <TotalRow
            label="Subtotal"
            value={formatCurrency(order.subtotal, currency)}
          />

          {/* Discount (if any) */}
          {order.totalDiscount > 0 && (
            <TotalRow
              label="Discount"
              value={`-${formatCurrency(order.totalDiscount, currency)}`}
            />
          )}

          {/* Tax */}
          <TotalRow
            label="Tax"
            value={formatCurrency(order.totalTax, currency)}
          />

          {/* Service Fees */}
          {order.serviceFees > 0 && (
            <TotalRow
              label="Service Fees"
              value={formatCurrency(order.serviceFees, currency)}
            />
          )}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        {/* Total */}
        <Grid size={{ xs: 12 }}>
          <Grid
            container
            sx={{
              bgcolor: "primary.lighter",
              borderRadius: 1,
              p: 1.5,
              border: "1px solid",
              borderColor: "primary.light",
            }}
          >
            <Grid size="grow">
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                Total
              </Typography>
            </Grid>
            <Grid size="auto">
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "primary.main",
                }}
              >
                {formatCurrency(order.totalAmount, currency)}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </InfoCard>
  );
};
