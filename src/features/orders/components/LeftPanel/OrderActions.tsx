import { Payment as PaymentIcon } from "@mui/icons-material";
import { Alert, Box, Button, Snackbar, useTheme } from "@mui/material";
import { useState } from "react";
import { OrderSource, PaymentMethod } from "../../../../db/enums";
import { useAppSelector } from "../../../../store/hooks";
import { selectCartItems, selectPreview } from "../../../../store/orderSlice";
import { ordersService } from "../../services/orders.service";
import { OrderDto } from "../../types/order.types";
import { OrderCompleteDialog } from "../Modals/OrderCompleteDialog";
import { PaymentModal } from "../Modals/PaymentModal";

interface OrderActionsProps {
  storeId: string;
}

export const OrderActions = ({ storeId }: OrderActionsProps) => {
  const theme = useTheme();
  const cartItems = useAppSelector(selectCartItems);
  const preview = useAppSelector(selectPreview);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderDto | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const hasItems = cartItems.length > 0;
  const totalAmount = preview?.totalAmount || 0;

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handlePayClick = () => {
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (
    amountPaid: number,
    method: PaymentMethod
  ) => {
    try {
      console.log("handlePaymentSubmit", {
        amountPaid,
        method,
      });
      // Validate cart has items
      if (cartItems.length === 0 || !method) {
        console.error("Cannot create order without items");
        showSnackbar("Cannot create order without items", "error");
        return;
      }

      // Convert cart items to CreateOrderItemDto (remove tempId)
      const orderItems = cartItems.map(({ tempId, ...item }) => item);

      console.log("orderItems", orderItems);

      // Create order with all items - this will reserve inventory
      const order = await ordersService.createOrder({
        storeId,
        items: orderItems,
        orderDate: new Date(),
        source: OrderSource.POS,
        paymentMethod: method,
      });
      console.log("order", order);

      // Update order with payment info
      await ordersService.updateOrderPayment(order.id, {
        amountPaid,
        paymentMethod: method,
      });

      setCreatedOrder(order);
      setPaymentAmount(amountPaid);
      setPaymentMethod(method);

      // Close payment modal and show completion dialog
      setPaymentModalOpen(false);
      setCompleteDialogOpen(true);
    } catch (error: any) {
      console.log("error", error);
      console.error("Failed to process payment:", error);
      showSnackbar(
        error.message || "Failed to process payment. Please try again.",
        "error"
      );
    }
  };

  const handleComplete = async () => {
    if (!createdOrder) return;

    try {
      await ordersService.completeOrder({
        orderId: createdOrder.id,
        paymentMethod: paymentMethod as any,
        amountPaid: paymentAmount,
      });

      showSnackbar("Order completed successfully!", "success");

      // Reload page to start new order after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Failed to complete order:", error);
      showSnackbar(
        error.message || "Failed to complete order. Please try again.",
        "error"
      );
    }
  };

  const handleVoid = async () => {
    if (!createdOrder) return;

    const confirmed = confirm("Are you sure you want to void this order?");
    if (!confirmed) return;

    try {
      await ordersService.voidOrder({
        orderId: createdOrder.id,
        reason: "User voided order",
      });

      showSnackbar("Order voided successfully!", "success");

      // Reload page to start fresh after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Failed to void order:", error);
      showSnackbar(
        error.message || "Failed to void order. Please try again.",
        "error"
      );
    }
  };

  const changeAmount = Math.max(0, paymentAmount - totalAmount);

  return (
    <>
      <Box
        sx={{
          p: 2,
          bgcolor: theme.palette.background.default,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Pay Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={!hasItems}
          onClick={handlePayClick}
          startIcon={<PaymentIcon />}
          color="primary"
        >
          Pay
        </Button>
      </Box>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        totalAmount={totalAmount}
        onSubmit={handlePaymentSubmit}
      />

      {/* Order Complete Dialog */}
      <OrderCompleteDialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        totalAmount={totalAmount}
        changeAmount={changeAmount}
        orderNumber={createdOrder?.orderNumber || ""}
        paymentMethod={paymentMethod}
        onComplete={handleComplete}
        onVoid={handleVoid}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
