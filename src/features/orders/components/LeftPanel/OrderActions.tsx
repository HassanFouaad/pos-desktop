import { Payment as PaymentIcon } from "@mui/icons-material";
import { Box, Button, useTheme } from "@mui/material";
import { useState } from "react";
import { container } from "tsyringe";
import { OrderSource, PaymentMethod } from "../../../../db/enums";
import { useAppSelector } from "../../../../store/hooks";
import { selectCartItems, selectPreview } from "../../../../store/orderSlice";
import { OrdersService } from "../../services/orders.service";
import { OrderDto } from "../../types/order.types";
import { OrderCompleteDialog } from "../Modals/OrderCompleteDialog";
import { PaymentModal } from "../Modals/PaymentModal";

const ordersService = container.resolve(OrdersService);

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

  const hasItems = cartItems.length > 0;
  const totalAmount = preview?.totalAmount || 0;

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
        return;
      }

      // Convert cart items to CreateOrderItemDto (remove tempId)
      const orderItems = cartItems.map(({ tempId, ...item }) => item);

      // Create order with all items - this will reserve inventory
      const order = await ordersService.createOrder({
        storeId,
        items: orderItems,
        orderDate: new Date(),
        source: OrderSource.POS,
        paymentMethod: method,
      });

      setCreatedOrder(order);
      setPaymentAmount(amountPaid);
      setPaymentMethod(method);

      // Close payment modal and show completion dialog
      setPaymentModalOpen(false);
      setCompleteDialogOpen(true);
    } catch (error: any) {
      console.error("Failed to process payment:", error);
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

      setCompleteDialogOpen(false);
    } catch (error: any) {
      console.error("Failed to complete order:", error);
    }
  };

  const handleVoid = async () => {
    if (!createdOrder) return;

    try {
      await ordersService.voidOrder({
        orderId: createdOrder.id,
      });

      setPaymentModalOpen(false);
      setCompleteDialogOpen(false);
    } catch (error: any) {
      console.error("Failed to void order:", error);
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
    </>
  );
};
