import { ShoppingCart as CartIcon } from "@mui/icons-material";
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { InfoCard } from "../../../../components/cards/InfoCard";
import { formatCurrency } from "../../../products/utils/pricing";
import { OrderItemDto } from "../../types/order.types";

interface OrderDetailsItemsProps {
  items: OrderItemDto[];
  currency?: string;
}

export const OrderDetailsItems = ({
  items,
  currency = "EGP",
}: OrderDetailsItemsProps) => {
  const theme = useTheme();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <InfoCard
      title="Order Items"
      icon={<CartIcon sx={{ fontSize: 32 }} />}
      iconColor={theme.palette.success.main}
      backgroundColor="paper"
    >
      <Grid container>
        <Grid size={{ xs: 12 }}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {item.variantName || item.productName}
                      </Typography>
                      {item.productName && item.variantName && (
                        <Typography variant="caption" color="text.secondary">
                          {item.productName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{item.quantity}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(item.unitPrice, currency)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(item.lineTotal, currency)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </InfoCard>
  );
};
