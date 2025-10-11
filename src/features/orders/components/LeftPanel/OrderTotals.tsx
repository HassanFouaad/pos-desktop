import { Divider, Grid, Typography, useTheme } from "@mui/material";
import { useAppSelector } from "../../../../store/hooks";
import { selectPreview } from "../../../../store/orderSlice";
import { formatCurrency } from "../../../products/utils/pricing";

interface OrderTotalsProps {
  currency?: string;
}

export const OrderTotals = ({ currency = "EGP" }: OrderTotalsProps) => {
  const theme = useTheme();
  const preview = useAppSelector(selectPreview);

  const subtotal = preview?.subtotal || 0;
  const totalDiscount = preview?.totalDiscount || 0;
  const totalTax = preview?.totalTax || 0;
  const serviceFees = preview?.serviceFees || 0;
  const totalAmount = preview?.totalAmount || 0;

  const TotalRow = ({
    label,
    value,
    variant = "body1",
    color,
    bold = false,
  }: {
    label: string;
    value: string;
    variant?: "body1" | "body2" | "h6";
    color?: string;
    bold?: boolean;
  }) => (
    <Grid container>
      <Grid size="grow">
        <Typography
          variant={variant}
          sx={{
            color: color || theme.palette.text.secondary,
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
            color: color || theme.palette.text.primary,
            fontWeight: bold ? 700 : 600,
          }}
        >
          {value}
        </Typography>
      </Grid>
    </Grid>
  );

  return (
    <Grid container sx={{ p: 2 }}>
      <Grid size={12}>
        {/* Subtotal */}
        <TotalRow label="Subtotal" value={formatCurrency(subtotal, currency)} />

        {/* Discount (if any) */}
        {totalDiscount > 0 && (
          <TotalRow
            label="Discount"
            value={`-${formatCurrency(totalDiscount, currency)}`}
            color={theme.palette.success.main}
          />
        )}

        {/* Tax */}
        <TotalRow
          label="Tax"
          value={formatCurrency(totalTax, currency)}
          variant="body2"
        />

        {/* Service Fees */}
        {serviceFees > 0 && (
          <TotalRow
            label="Service Fees"
            value={formatCurrency(serviceFees, currency)}
            variant="body2"
            color={theme.palette.success.main}
          />
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Total */}
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
                color: theme.palette.text.primary,
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
                color: theme.palette.primary.main,
              }}
            >
              {formatCurrency(totalAmount, currency)}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
