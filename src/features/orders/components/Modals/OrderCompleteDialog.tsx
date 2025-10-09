import {
  CheckCircle as CompleteIcon,
  Payment as PaymentIcon,
  Cancel as VoidIcon,
} from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { ResponsiveDialog } from "../../../../components/common/ResponsiveDialog";

interface OrderCompleteDialogProps {
  open: boolean;
  onClose: () => void;
  totalAmount: number;
  changeAmount: number;
  orderNumber: string;
  paymentMethod: string;
  onComplete: () => void;
  onVoid: () => void;
}

export const OrderCompleteDialog = ({
  open,
  onClose,
  totalAmount,
  changeAmount,
  orderNumber,
  paymentMethod,
  onComplete,
  onVoid,
}: OrderCompleteDialogProps) => {
  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      contentSx={{
        textAlign: "center",
        py: 6,
        px: 4,
      }}
    >
      {/* Payment Icon */}
      <Box
        sx={{
          display: "inline-flex",
          p: 3,
          borderRadius: "50%",
          bgcolor: "primary.lighter",
          mb: 3,
        }}
      >
        <PaymentIcon
          sx={{
            fontSize: 80,
            color: "primary.main",
          }}
        />
      </Box>

      {/* Title */}
      <Typography
        variant="h4"
        color="primary.main"
        sx={{ fontWeight: 700, mb: 1 }}
      >
        Payment Received
      </Typography>

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
            ${totalAmount.toFixed(2)}
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
                ${changeAmount.toFixed(2)}
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
          startIcon={<CompleteIcon />}
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
        >
          Void Order
        </Button>
      </Box>
    </ResponsiveDialog>
  );
};
