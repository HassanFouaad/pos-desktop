import { Payment as PaymentIcon } from "@mui/icons-material";
import { Button, Grid, useTheme } from "@mui/material";
import { useState } from "react";
import { container } from "tsyringe";
import { OrderSource, PaymentMethod } from "../../../../db/enums";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  completeOrder as completeOrderAction,
  selectCartItems,
  selectPreview,
  voidOrder as voidOrderAction,
} from "../../../../store/orderSlice";
import { OrdersService } from "../../services/orders.service";
import { OrderDto } from "../../types/order.types";
import { OrderCompleteDialog } from "../Modals/OrderCompleteDialog";
import { PaymentModal } from "../Modals/PaymentModal";

const ordersService = container.resolve(OrdersService);

interface OrderActionsProps {
  storeId: string;
  currency?: string;
}

export const OrderActions = ({
  storeId,
  currency = "EGP",
}: OrderActionsProps) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const preview = useAppSelector(selectPreview);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderDto | null>(null);

  const hasItems = cartItems.length > 0;
  const totalAmount = createdOrder?.totalAmount || preview?.totalAmount || 0;

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
        amountPaid: amountPaid,
      });

      setCreatedOrder(order);

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
      const completedOrder = await ordersService.completeOrder({
        orderId: createdOrder.id,
      });

      // Close dialog first
      setCompleteDialogOpen(false);
      setCreatedOrder(null);

      // Then close the tab
      dispatch(completeOrderAction(completedOrder));
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

      // Close dialogs first
      setPaymentModalOpen(false);
      setCompleteDialogOpen(false);
      setCreatedOrder(null);

      // Then close the tab
      dispatch(voidOrderAction());
    } catch (error: any) {
      console.error("Failed to void order:", error);
    }
  };

  const handleDialogClose = () => {
    // When dialog is closed without action, just close the dialog
    setCompleteDialogOpen(false);
  };

  return (
    <>
      <Grid
        container
        sx={{
          height: 1,
          p: 1.5,
          bgcolor: theme.palette.background.default,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Grid size={12}>
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
        </Grid>
      </Grid>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        totalAmount={totalAmount}
        onSubmit={handlePaymentSubmit}
        currency={currency}
      />

      {/* Order Complete Dialog */}
      <OrderCompleteDialog
        open={completeDialogOpen}
        onClose={handleDialogClose}
        totalAmount={totalAmount}
        changeAmount={createdOrder?.changeGiven || 0}
        orderNumber={createdOrder?.orderNumber || ""}
        paymentMethod={createdOrder?.paymentMethod ?? PaymentMethod.CASH}
        onComplete={handleComplete}
        onVoid={handleVoid}
        currency={currency}
      />
    </>
  );
};
