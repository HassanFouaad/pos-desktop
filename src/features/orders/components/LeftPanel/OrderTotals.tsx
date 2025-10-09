import { Box, Divider, Typography, useTheme } from "@mui/material";
import { useAppSelector } from "../../../../store/hooks";
import { selectCartItems, selectPreview } from "../../../../store/orderSlice";

export const OrderTotals = () => {
  const theme = useTheme();
  const preview = useAppSelector(selectPreview);
  const cartItems = useAppSelector(selectCartItems);

  const subtotal = preview?.subtotal || 0;
  const totalDiscount = preview?.totalDiscount || 0;
  const totalTax = preview?.totalTax || 0;
  const totalAmount = preview?.totalAmount || 0;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.75,
      }}
    >
      <Typography
        variant={variant}
        sx={{
          color: color || theme.palette.text.secondary,
          fontWeight: bold ? 600 : 400,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant={variant}
        sx={{
          color: color || theme.palette.text.primary,
          fontWeight: bold ? 700 : 600,
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* Item Count */}
      <TotalRow
        label="Items"
        value={`${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        variant="body2"
      />

      <Divider sx={{ my: 1 }} />

      {/* Subtotal */}
      <TotalRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />

      {/* Discount (if any) */}
      {totalDiscount > 0 && (
        <TotalRow
          label="Discount"
          value={`-$${totalDiscount.toFixed(2)}`}
          color={theme.palette.success.main}
        />
      )}

      {/* Tax */}
      <TotalRow label="Tax" value={`$${totalTax.toFixed(2)}`} variant="body2" />

      <Divider sx={{ my: 1.5 }} />

      {/* Total */}
      <Box
        sx={{
          bgcolor: "primary.lighter",
          borderRadius: 2,
          p: 1.5,
          border: "1px solid",
          borderColor: "primary.light",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            Total
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: theme.palette.primary.main,
            }}
          >
            ${totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
