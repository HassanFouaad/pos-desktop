import {
  CheckCircle as CompleteIcon,
  Cancel as VoidIcon,
} from "@mui/icons-material";
import { Grid } from "@mui/material";
import { useState } from "react";
import { container } from "tsyringe";
import { TouchButton } from "../../../../components/common/TouchButton";
import { PaymentMethod } from "../../../../db/enums";
import { OrdersService } from "../../services/orders.service";
import { OrderDto } from "../../types/order.types";
import { PaymentModal } from "../Modals/PaymentModal";

const ordersService = container.resolve(OrdersService);

interface OrderDetailsActionsProps {
  order: OrderDto;
  onRefresh: () => void;
  currency?: string;
}

export const OrderDetailsActions = ({
  order,
  onRefresh,
  currency = "EGP",
}: OrderDetailsActionsProps) => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCompleteClick = () => {
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (
    amountPaid: number,
    method: PaymentMethod
  ) => {
    setIsProcessing(true);
    try {
      await ordersService.completeOrder({
        orderId: order.id,
        paymentMethod: method,
        amountPaid: amountPaid,
        orderDate: new Date(),
      });

      setPaymentModalOpen(false);
      onRefresh();
    } catch (error) {
      console.error("Failed to complete order:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoid = async () => {
    setIsProcessing(true);
    try {
      await ordersService.voidOrder({
        orderId: order.id,
      });

      onRefresh();
    } catch (error) {
      console.error("Failed to void order:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TouchButton
            variant="contained"
            size="large"
            color="success"
            startIcon={<CompleteIcon />}
            onClick={handleCompleteClick}
            disabled={isProcessing}
            fullWidth
          >
            Complete Order
          </TouchButton>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TouchButton
            variant="outlined"
            size="large"
            color="error"
            startIcon={<VoidIcon />}
            onClick={handleVoid}
            disabled={isProcessing}
            fullWidth
          >
            Void Order
          </TouchButton>
        </Grid>
      </Grid>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => !isProcessing && setPaymentModalOpen(false)}
        totalAmount={order.totalAmount}
        onSubmit={handlePaymentSubmit}
        order={order}
        currency={currency}
      />
    </>
  );
};
