import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { formatCurrency } from "../../../products/utils/pricing";
import type { OrderItemDto } from "../../types/order.types";

interface PaymentModalOrderItemsProps {
  items: OrderItemDto[];
  currency?: string;
}

/**
 * Displays order items in a table format for the payment modal
 */
export const PaymentModalOrderItems: React.FC<PaymentModalOrderItemsProps> = ({
  items,
  currency = "EGP",
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
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
          {items.map((item, index) => (
            <TableRow key={index}>
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
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right">
                {formatCurrency(item.unitPrice, currency)}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(item.lineTotal, currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
