import {
  CheckCircle as CompleteIcon,
  Cancel as VoidIcon,
} from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { ResponsiveDialog } from "../../../../components/common/ResponsiveDialog";
import { PaymentMethod } from "../../../../db/enums";
import { formatCurrency } from "../../../products/utils/pricing";

interface OrderConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  totalAmount: number;
  changeAmount: number;
  orderNumber: string;
  paymentMethod: PaymentMethod;
  onComplete: () => void;
  onVoid: () => void;
  currency?: string;
}

export const OrderConfirmationDialog = ({
  open,
  onClose,
  totalAmount,
  changeAmount,
  orderNumber,
  paymentMethod,
  onComplete,
  onVoid,
  currency = "EGP",
}: OrderConfirmationDialogProps) => {
  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      contentSx={{
        textAlign: "center",
        py: 6,
        px: 4,
      }}
    >
      <Typography
        variant="h6"
        color="text.primary"
        sx={{ fontWeight: 600, mb: 1 }}
      >
        Order #{orderNumber}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Choose to complete or void this order
      </Typography>

      {/* Order Summary */}
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: "background.default",
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Total Amount
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            {formatCurrency(totalAmount, currency)}
          </Typography>
        </Box>

        {/* Change - Only show for CASH payments */}
        {paymentMethod.toLowerCase() === "cash" && changeAmount > 0 && (
          <>
            <Box sx={{ height: 2, bgcolor: "divider", my: 2 }} />
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "warning.lighter",
                border: "1px solid",
                borderColor: "warning.light",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                Change to Give
              </Typography>
              <Typography variant="h4" color="warning.main" fontWeight={800}>
                {formatCurrency(changeAmount, currency)}
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          color="success"
          startIcon={<CompleteIcon sx={{ fontSize: 28 }} />}
          onClick={onComplete}
          fullWidth
        >
          Complete Order
        </Button>

        <Button
          variant="outlined"
          size="large"
          color="error"
          startIcon={<VoidIcon />}
          onClick={onVoid}
          fullWidth
          sx={{
            minHeight: 56,
          }}
        >
          Void Order
        </Button>
      </Box>
    </ResponsiveDialog>
  );
};
