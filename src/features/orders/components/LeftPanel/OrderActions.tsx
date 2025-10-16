import { Payment as PaymentIcon } from "@mui/icons-material";
import { Button, Grid, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { container } from "tsyringe";
import { ResponsiveDialog } from "../../../../components/common/ResponsiveDialog";
import { OrderSource, PaymentMethod } from "../../../../db/enums";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  completeOrder as completeOrderAction,
  selectCartItems,
  selectNotes,
  selectPreview,
  selectSelectedCustomer,
  voidOrder as voidOrderAction,
} from "../../../../store/orderSlice";
import { OrdersService } from "../../services/orders.service";
import { OrderDto } from "../../types/order.types";
import { OrderConfirmationDialog } from "../Modals/OrderConfirmationDialog";
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
  const selectedCustomer = useAppSelector(selectSelectedCustomer);
  const notes = useAppSelector(selectNotes);

  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderDto | null>(null);

  const hasItems = cartItems.length > 0;
  const totalAmount = createdOrder?.totalAmount || preview?.totalAmount || 0;

  const handleCreateClick = () => {
    setConfirmCreateOpen(true);
  };

  const handleConfirmCreate = async () => {
    try {
      // Validate cart has items
      if (cartItems.length === 0) {
        console.error("Cannot create order without items");
        return;
      }

      // Convert cart items to CreateOrderItemDto (remove tempId)
      const orderItems = cartItems.map(({ tempId, ...item }) => item);

      // Create order with default payment method (CASH) - this will reserve inventory
      const order = await ordersService.createOrder({
        storeId,
        items: orderItems,
        orderDate: new Date(),
        source: OrderSource.POS,
        paymentMethod: PaymentMethod.CASH, // Default payment method
        customerId: selectedCustomer.id || undefined,
        notes: notes || undefined,
      });

      setCreatedOrder(order);

      // Close confirmation and show completion dialog
      setConfirmCreateOpen(false);
      setCompleteDialogOpen(true);
    } catch (error: any) {
      console.error("Failed to create order:", error);
    }
  };

  const handleShowPaymentModal = () => {
    // When user clicks "Complete" in the dialog, show payment modal
    setCompleteDialogOpen(false);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (
    amountPaid: number,
    method: PaymentMethod
  ) => {
    if (!createdOrder) return;

    try {
      const completedOrder = await ordersService.completeOrder({
        orderId: createdOrder.id,
        paymentMethod: method,
        amountPaid: amountPaid,
        orderDate: new Date(),
      });

      // Close payment modal
      setPaymentModalOpen(false);
      setCreatedOrder(null);

      // Complete the tab
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
    setCreatedOrder(null);
    if (createdOrder) {
      dispatch(voidOrderAction());
    }
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
          {/* Create Order Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!hasItems}
            onClick={handleCreateClick}
            startIcon={<PaymentIcon />}
            color="primary"
          >
            Create Order
          </Button>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <ResponsiveDialog
        open={confirmCreateOpen}
        onClose={() => setConfirmCreateOpen(false)}
        maxWidth="sm"
        title={<Typography variant="h6">Confirm Order Creation</Typography>}
        actions={
          <>
            <Button
              onClick={() => setConfirmCreateOpen(false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCreate}
              variant="contained"
              color="primary"
            >
              Confirm
            </Button>
          </>
        }
      >
        <Typography>
          Are you sure you want to create this order? This will reserve
          inventory.
        </Typography>
      </ResponsiveDialog>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        totalAmount={totalAmount}
        onSubmit={handlePaymentSubmit}
        order={createdOrder}
        currency={currency}
      />

      {/* Order Complete Dialog */}
      <OrderConfirmationDialog
        open={completeDialogOpen}
        onClose={handleDialogClose}
        totalAmount={totalAmount}
        changeAmount={0}
        orderNumber={createdOrder?.orderNumber || ""}
        paymentMethod={PaymentMethod.CASH}
        onComplete={handleShowPaymentModal}
        onVoid={handleVoid}
        currency={currency}
      />
    </>
  );
};
