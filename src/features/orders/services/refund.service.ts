import { OrderStatus, PaymentMethod, RefundMethod } from "../../../db/enums";
import { orderItemsRepository } from "../repositories/order-items.repository";
import { ordersRepository } from "../repositories/orders.repository";
import { returnItemsRepository } from "../repositories/return-items.repository";
import { returnsRepository } from "../repositories/returns.repository";
import { OrderItemDto } from "../types/order.types";
import {
  ProcessRefundDto,
  RefundCalculationResultDto,
  RefundItemCalculationDto,
  RefundPaymentBreakdownDto,
  RefundResultDto,
  ReturnDto,
} from "../types/return.types";

export class RefundService {
  /**
   * Calculate refund amount for return items
   * @param returnId ID of the return
   * @returns RefundCalculationResultDto with refund details
   */
  async calculateRefund(returnId: string): Promise<RefundCalculationResultDto> {
    // Get the return and associated items
    const returnRecord = await returnsRepository.findById(returnId);
    if (!returnRecord) {
      throw new Error("Return not found");
    }

    const returnItems = await returnItemsRepository.findByReturnId(returnId);
    if (!returnItems || returnItems.length === 0) {
      throw new Error("No return items found");
    }

    // Get the original order to determine payment methods
    const originalOrder = await ordersRepository.findById(
      returnRecord.originalOrderId
    );
    if (!originalOrder) {
      throw new Error("Original order not found");
    }

    // Calculate refund for each item
    const itemCalculations: RefundItemCalculationDto[] = [];
    let totalRefundAmount = 0;
    let totalTaxRefund = 0;

    // Get all order items for the original order
    const orderItems = originalOrder.items || [];
    const orderItemsMap = new Map<string, OrderItemDto>();
    orderItems.forEach((item) => orderItemsMap.set(item.id, item));

    for (const returnItem of returnItems) {
      const orderItem = orderItemsMap.get(returnItem.originalOrderItemId);

      if (!orderItem) {
        throw new Error("Order item not found");
      }

      // Calculate item refund
      const unitPrice = orderItem.unitPrice;
      const lineSubtotal = unitPrice * returnItem.quantityReturned;

      // Calculate proportional discount
      const itemDiscount = orderItem.lineDiscount
        ? (orderItem.lineDiscount / orderItem.quantity) *
          returnItem.quantityReturned
        : 0;

      // Calculate tax (proportionally distributed)
      const lineTax = this.calculateProportionalTax(
        orderItem,
        returnItem.quantityReturned,
        originalOrder.totalTax,
        originalOrder.subtotal
      );
      totalTaxRefund += lineTax;

      // Calculate restocking fee if applicable
      const restockingFee = this.calculateRestockingFee(returnItem, orderItem);

      // Calculate total refund for this item
      const itemTotalRefund =
        lineSubtotal - itemDiscount + lineTax - restockingFee;
      totalRefundAmount += itemTotalRefund;

      // Add to item calculations
      itemCalculations.push({
        originalOrderItemId: orderItem.id,
        quantity: returnItem.quantityReturned,
        unitPrice,
        originalUnitPrice: orderItem.originalUnitPrice || unitPrice,
        lineSubtotal,
        lineDiscount: itemDiscount,
        lineTax,
        restockingFee,
        totalRefund: itemTotalRefund,
      });
    }

    // Determine payment breakdown based on original order
    const paymentBreakdown = this.calculatePaymentBreakdown(
      originalOrder,
      totalRefundAmount
    );

    return {
      totalRefundAmount,
      paymentBreakdown,
      taxRefundAmount: totalTaxRefund,
      items: itemCalculations,
    };
  }

  /**
   * Process a refund for a return
   * @param processRefundDto Refund processing data
   * @param userId ID of user processing the refund
   * @returns RefundResultDto with refund details
   */
  async processRefund(
    processRefundDto: ProcessRefundDto,
    userId: string
  ): Promise<RefundResultDto> {
    try {
      // Get the return
      const returnRecord = await returnsRepository.findById(
        processRefundDto.returnId
      );

      if (!returnRecord) {
        throw new Error("Return not found");
      }

      // Calculate refund amount if not already set
      let refundAmount = returnRecord.refundAmount;
      if (!refundAmount) {
        const calculation = await this.calculateRefund(returnRecord.id);
        refundAmount = calculation.totalRefundAmount;
      }

      // Process refund based on method
      let refundResult: RefundResultDto;

      switch (processRefundDto.refundMethod) {
        case RefundMethod.ORIGINAL_PAYMENT:
          refundResult = await this.processOriginalPaymentRefund(
            returnRecord,
            refundAmount,
            processRefundDto.paymentDetails
          );
          break;

        case RefundMethod.STORE_CREDIT:
          refundResult = await this.processStoreCreditRefund(
            returnRecord,
            refundAmount
          );
          break;

        case RefundMethod.CASH:
          refundResult = await this.processCashRefund(
            returnRecord,
            refundAmount,
            processRefundDto.paymentDetails
          );
          break;

        default:
          throw new Error("Unsupported refund method");
      }

      // Update the return with refund details
      await returnsRepository.update(returnRecord.id, {
        refundMethod: processRefundDto.refundMethod,
        refundAmount,
        notes: processRefundDto.notes || returnRecord.notes,
        processedBy: userId,
      });

      // Update the status of the original order
      const originalOrder = await ordersRepository.findById(
        returnRecord.originalOrderId
      );

      if (originalOrder) {
        // Check if all items in the order are fully returned
        const orderItems = await orderItemsRepository.findByOrderId(
          originalOrder.id
        );

        // Get return items for this order to calculate total returned quantities
        const returns = await returnsRepository.findByOriginalOrderId(
          originalOrder.id
        );

        // Create a map to track total returned quantities for each order item
        const returnQuantitiesMap = new Map<string, number>();

        // Initialize the map with all order item IDs and zero quantities
        orderItems.forEach((item) => {
          returnQuantitiesMap.set(item.id, 0);
        });

        // Aggregate returned quantities from all returns for this order
        for (const returnRecord of returns) {
          if (returnRecord.items) {
            for (const item of returnRecord.items) {
              const currentTotal =
                returnQuantitiesMap.get(item.originalOrderItemId) || 0;
              returnQuantitiesMap.set(
                item.originalOrderItemId,
                currentTotal + item.quantityReturned
              );
            }
          }
        }

        // Check if all items are fully returned
        let isFullReturn = true;
        for (const orderItem of orderItems) {
          const returnedQuantity = returnQuantitiesMap.get(orderItem.id) || 0;
          if (returnedQuantity < orderItem.quantity) {
            isFullReturn = false;
            break;
          }
        }

        // Update the order status
        await ordersRepository.updateOrder(originalOrder.id, {
          status: isFullReturn
            ? OrderStatus.REFUNDED
            : OrderStatus.PARTIALLY_REFUNDED,
        });
      }

      return refundResult;
    } catch (error) {
      console.error("Error processing refund:", error);
      throw error;
    }
  }

  /**
   * Calculate proportional tax for returned items
   * @param orderItem Original order item
   * @param returnQuantity Quantity being returned
   * @param orderTotalTax Total tax on the original order
   * @param orderSubtotal Subtotal of the original order
   * @returns Proportional tax amount for the returned quantity
   */
  private calculateProportionalTax(
    orderItem: OrderItemDto,
    returnQuantity: number,
    orderTotalTax: number,
    orderSubtotal: number
  ): number {
    if (orderSubtotal <= 0 || orderTotalTax <= 0) {
      return 0;
    }

    // Calculate what percentage of the order subtotal this item represents
    const itemSubtotal = orderItem.unitPrice * orderItem.quantity;
    const itemSubtotalPercentage = itemSubtotal / orderSubtotal;

    // Calculate what portion of the total tax this item represents
    const itemTotalTax = orderTotalTax * itemSubtotalPercentage;

    // Calculate tax for the returned quantity
    const returnItemTax = (itemTotalTax / orderItem.quantity) * returnQuantity;

    return returnItemTax;
  }

  /**
   * Calculate restocking fee if applicable
   * @param returnItem Return item
   * @param orderItem Original order item
   * @returns Restocking fee amount
   */
  private calculateRestockingFee(
    returnItem: any,
    orderItem: OrderItemDto
  ): number {
    // For now, we'll have a simple implementation with no restocking fee
    // In a real implementation, this would check store policy, item condition, etc.
    return 0;
  }

  /**
   * Calculate payment breakdown based on original order payment method
   * @param originalOrder Original order
   * @param totalRefundAmount Total refund amount
   * @returns Array of payment breakdowns
   */
  private calculatePaymentBreakdown(
    originalOrder: any,
    totalRefundAmount: number
  ): RefundPaymentBreakdownDto[] {
    // In this simplified implementation, we assume a single payment method
    // In a real implementation, this would handle split payments

    const paymentMethod = originalOrder.paymentMethod || PaymentMethod.CASH;
    let recommendedRefundMethod: RefundMethod;

    switch (paymentMethod) {
      case PaymentMethod.CARD:
        recommendedRefundMethod = RefundMethod.ORIGINAL_PAYMENT;
        break;

      case PaymentMethod.STORE_CREDIT:
        recommendedRefundMethod = RefundMethod.STORE_CREDIT;
        break;

      case PaymentMethod.CASH:
        recommendedRefundMethod = RefundMethod.CASH;
        break;

      default:
        recommendedRefundMethod = RefundMethod.STORE_CREDIT;
    }

    return [
      {
        paymentMethod,
        amount: totalRefundAmount,
        refundMethod: recommendedRefundMethod,
        refundable: true,
      },
    ];
  }

  /**
   * Process refund to original payment method
   * @param returnRecord Return record
   * @param refundAmount Amount to refund
   * @param paymentDetails Payment details for the refund
   * @returns RefundResultDto with refund details
   */
  private async processOriginalPaymentRefund(
    returnRecord: ReturnDto,
    refundAmount: number,
    paymentDetails?: any
  ): Promise<RefundResultDto> {
    // For demonstration, we'll simulate a successful refund
    const transactionId = paymentDetails?.transactionId || `ref-${Date.now()}`;

    return {
      success: true,
      returnId: returnRecord.id,
      refundAmount,
      refundMethod: RefundMethod.ORIGINAL_PAYMENT,
      transactionId,
      refundDate: new Date(),
      notes: "Refunded to original payment method",
    };
  }

  /**
   * Process refund as store credit
   * @param returnRecord Return record
   * @param refundAmount Amount to refund
   * @returns RefundResultDto with refund details
   */
  private async processStoreCreditRefund(
    returnRecord: ReturnDto,
    refundAmount: number
  ): Promise<RefundResultDto> {
    return {
      success: true,
      returnId: returnRecord.id,
      refundAmount,
      refundMethod: RefundMethod.STORE_CREDIT,
      transactionId: `sc-${Date.now()}`,
      refundDate: new Date(),
      notes: "Issued as store credit",
    };
  }

  /**
   * Process cash refund
   * @param returnRecord Return record
   * @param refundAmount Amount to refund
   * @param paymentDetails Payment details for the refund
   * @returns RefundResultDto with refund details
   */
  private async processCashRefund(
    returnRecord: ReturnDto,
    refundAmount: number,
    paymentDetails?: any
  ): Promise<RefundResultDto> {
    const receiptNumber = paymentDetails?.receiptNumber || `cash-${Date.now()}`;

    return {
      success: true,
      returnId: returnRecord.id,
      refundAmount,
      refundMethod: RefundMethod.CASH,
      receiptNumber,
      refundDate: new Date(),
      notes: "Refunded in cash",
    };
  }
}

export const refundService = new RefundService();
