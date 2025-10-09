import { v4 as uuidv4 } from "uuid";
import { drizzleDb } from "../../../db";
import {
  OrderItemStockType,
  OrderSource,
  OrderStatus,
  OrderType,
  PaymentStatus,
} from "../../../db/enums";
import { customersService } from "../../customers/services/customers.service";
import { inventoryRepository } from "../../inventory/repository/inventory.repository";
import { storesRepository } from "../../stores/repositories/stores.repository";
import { usersRepository } from "../../users/repositories/users.repository";
import { orderHistoryRepository } from "../repositories/order-history.repository";
import { orderItemsRepository } from "../repositories/order-items.repository";
import { ordersRepository } from "../repositories/orders.repository";
import {
  CompleteOrderDto,
  CreateOrderDto,
  CreateOrderItemDto,
  OrderDto,
  OrderItemDto,
  PreviewOrderDto,
  PreviewOrderItemDto,
  VoidOrderDto,
} from "../types/order.types";
import { orderItemsService } from "./order-items.service";

export class OrdersService {
  /**
   * Preview a sales order without saving to database
   * This is called on every cart change to update totals
   */
  async previewOrder(
    items: CreateOrderItemDto[],
    storeId: string
  ): Promise<PreviewOrderDto> {
    if (!items || items.length === 0) {
      return {
        items: [],
        subtotal: 0,
        totalDiscount: 0,
        totalTax: 0,
        totalAmount: 0,
      };
    }

    // Validate store exists
    const store = await storesRepository.getCurrentStore();
    if (!store) {
      throw new Error("Store not found");
    }

    // Get preview items with calculations
    const previewItems = await orderItemsService.previewOrderItems(
      items,
      storeId
    );

    // Calculate order totals
    const { subtotal, totalDiscount, totalTax, totalAmount } =
      this.calculateSalesOrderTotals(previewItems);

    return {
      items: previewItems,
      subtotal,
      totalDiscount,
      totalTax,
      totalAmount,
    };
  }

  /**
   * Create a new sales order in PENDING status with items and inventory reservation
   * Note: No transaction wrapper - PowerSync handles consistency
   */
  async createOrder(data: CreateOrderDto): Promise<OrderDto> {
    console.log("Creating order with data", data);

    // Validate that we have items
    if (!data.items || data.items.length === 0) {
      console.error("Cannot create order without items");
      throw new Error("Cannot create order without items");
    }

    // Validate store exists
    const store = await storesRepository.getCurrentStore();
    if (!store) {
      throw new Error("Store not found");
    }

    const user = await usersRepository.getLoggedInUser();
    const tenant = await storesRepository.getCurrentTenant();
    const localId = uuidv4();

    console.log("Getting preview for order");

    try {
      // First preview the order to get all calculated values
      const previewOrder = await this.previewOrder(data.items, store.id);

      // Calculate payment amounts
      const { paymentStatus, amountPaid, amountDue, changeGiven } =
        this.calculateSalesOrderPaymentAmounts(
          previewOrder.totalAmount,
          data.amountPaid
        );

      const orderId = await drizzleDb.transaction(
        async (tx: any): Promise<string> => {
          // Create order with calculated totals
          const orderId = await ordersRepository.createOrder(
            {
              ...data,
              storeId: store.id,
              customerId: data.customerId,
              orderType: OrderType.SALE,
              source: data.source || OrderSource.POS,
              status: OrderStatus.PENDING,
              subtotal: previewOrder.subtotal,
              totalDiscount: previewOrder.totalDiscount,
              totalTax: previewOrder.totalTax,
              totalAmount: previewOrder.totalAmount,
              paymentMethod: data.paymentMethod,
              paymentStatus: paymentStatus,
              amountPaid: amountPaid,
              amountDue: amountDue,
              changeGiven: changeGiven,
              notes: data.notes,
              internalNotes: data.internalNotes,
              orderDate: new Date(),
              tenantId: tenant?.id ?? "",
              localId,
              id: localId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            store?.code ?? "",
            tx
          );
          let toCreateOrderItems: OrderItemDto[] = [];
          // Create order items
          for (const previewItem of previewOrder.items) {
            toCreateOrderItems.push({
              orderId: orderId,
              storeId: store.id ?? "",
              tenantId: tenant?.id ?? "",
              variantId: previewItem.variantId,
              quantity: previewItem.quantity,
              unitPrice: previewItem.unitPrice,
              originalUnitPrice: previewItem.originalUnitPrice,
              lineSubtotal: previewItem.lineSubtotal,
              lineDiscount: previewItem.lineDiscount,
              lineTotalBeforeTax: previewItem.lineTotalBeforeTax,
              productName: previewItem.productName,
              variantName: previewItem.variantName,
              productSku: previewItem.productSku,
              variantAttributes: previewItem.variantAttributes,
              stockType: previewItem.stockType,
              lineTotal: previewItem.lineTotal,
              id: uuidv4(),
              isReturned: false,
              returnedQuantity: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            console.log("Order item created");

            // Reserve inventory for stock items
            if (
              previewItem.stockType === OrderItemStockType.INVENTORY &&
              previewItem.variantId
            ) {
              console.log("Reserving inventory for stock item");
              await inventoryRepository.reserveStock(
                {
                  variantId: previewItem.variantId,
                  storeId: store.id,
                  quantity: previewItem.quantity,
                  referenceId: orderId,
                  currentUserId: user?.id as string,
                  tenantId: tenant?.id ?? "",
                },
                tx
              );
            }
          }

          await orderItemsRepository.createBulk(toCreateOrderItems, tx);
          // Create initial order history entry
          await orderHistoryRepository.create(
            {
              orderId: orderId,
              userId: user?.id,
              fromStatus: OrderStatus.PENDING,
              toStatus: OrderStatus.PENDING,
              storeId: store?.id ?? "",
              tenantId: tenant?.id ?? "",
            },
            tx
          );

          return orderId;
        }
      );

      console.log("Order created with ID:", orderId);

      // Return the complete order with items
      const createdOrder = await ordersRepository.findById(orderId);
      console.log("Created order", createdOrder);
      return createdOrder as OrderDto;
    } catch (error) {
      console.error("Error creating order", error);
      throw error;
    }
  }

  /**
   * Complete order - consume inventory, update customer data, and finalize
   * Note: No transaction wrapper - PowerSync handles consistency
   */
  async completeOrder(data: CompleteOrderDto): Promise<OrderDto> {
    const tenant = await storesRepository.getCurrentTenant();
    const order = await ordersRepository.findById(data.orderId);
    const user = await usersRepository.getLoggedInUser();

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error("Order must be in PENDING status to complete");
    }

    try {
      // Consume inventory for all stock items
      const items = await orderItemsRepository.findByOrderId(data.orderId);

      for (const item of items) {
        if (item.stockType === OrderItemStockType.INVENTORY && item.variantId) {
          await inventoryRepository.consumeStock(
            item.variantId,
            order.storeId,
            item.quantity,
            data.orderId,
            user?.id as string,
            tenant?.id ?? ""
          );
        }
      }

      // Calculate change
      const changeGiven = Math.max(0, data.amountPaid - order.totalAmount);

      // Update order status
      await ordersRepository.updateOrder(data.orderId, {
        status: OrderStatus.COMPLETED,
        paymentMethod: data.paymentMethod,
        paymentStatus: PaymentStatus.PAID,
        amountPaid: data.amountPaid,
        amountDue: 0,
        changeGiven,
        completedAt: data.orderDate || new Date(),
        orderDate: data.orderDate || order.orderDate,
      });

      // Create order history entry for completion
      await orderHistoryRepository.create({
        orderId: data.orderId,
        userId: user?.id,
        fromStatus: OrderStatus.PENDING,
        toStatus: OrderStatus.COMPLETED,
        storeId: order.storeId,
        tenantId: tenant?.id ?? "",
      });

      // Update customer visit data if customer is associated
      if (order.customerId) {
        try {
          await customersService.updateVisitData(
            order.customerId,
            order.totalAmount
          );
        } catch (error) {
          console.error("Failed to update customer visit data:", error);
          // Don't fail the entire operation if customer update fails
        }
      }

      return ordersRepository.findById(data.orderId) as Promise<OrderDto>;
    } catch (error) {
      console.error("Error completing order:", error);
      throw error;
    }
  }

  /**
   * Void order - release all reserved inventory
   * Note: No transaction wrapper - PowerSync handles consistency
   */
  async voidOrder(data: VoidOrderDto): Promise<void> {
    const tenant = await storesRepository.getCurrentTenant();
    const order = await ordersRepository.findById(data.orderId);
    const user = await usersRepository.getLoggedInUser();

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error("Only PENDING orders can be voided");
    }

    try {
      // Release inventory for all stock items
      const items = await orderItemsRepository.findByOrderId(data.orderId);

      for (const item of items) {
        if (item.stockType === OrderItemStockType.INVENTORY && item.variantId) {
          await inventoryRepository.releaseStock(
            item.variantId,
            order.storeId,
            item.quantity,
            data.orderId,
            user?.id as string,
            tenant?.id ?? ""
          );
        }
      }

      // Update order status
      await ordersRepository.updateOrder(data.orderId, {
        status: OrderStatus.VOIDED,
        internalNotes: data.reason,
      });

      // Create order history entry for voiding
      await orderHistoryRepository.create({
        orderId: data.orderId,
        userId: user?.id,
        fromStatus: OrderStatus.PENDING,
        toStatus: OrderStatus.VOIDED,
        storeId: order.storeId,
        tenantId: tenant?.id ?? "",
      });
    } catch (error) {
      console.error("Error voiding order:", error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<OrderDto | null> {
    return ordersRepository.findById(orderId);
  }

  // Private helper methods

  /**
   * Calculate order totals from preview items
   * @param previewItems Preview order items with calculated values
   * @returns Order totals
   */
  private calculateSalesOrderTotals(previewItems: PreviewOrderItemDto[]): {
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    totalAmount: number;
  } {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    // Sum up all line totals from the preview items
    for (const item of previewItems) {
      subtotal += item.lineSubtotal;
      totalDiscount += item.lineDiscount;
      totalTax += item.lineTax;
    }

    // Calculate final amount
    const totalAmount = subtotal - totalDiscount + totalTax;

    return {
      subtotal,
      totalDiscount,
      totalTax,
      totalAmount,
    };
  }

  /**
   * Calculate payment amounts and status
   * @param totalAmount Total order amount
   * @param amountPaid Amount paid by customer
   * @returns Payment status and amounts
   */
  private calculateSalesOrderPaymentAmounts(
    totalAmount: number,
    amountPaid?: number
  ): {
    paymentStatus: PaymentStatus;
    amountPaid: number;
    amountDue: number;
    changeGiven: number;
  } {
    let paymentStatus: PaymentStatus;
    let finalAmountPaid: number;
    let amountDue: number;
    let changeGiven = 0;

    if (amountPaid !== undefined) {
      finalAmountPaid = amountPaid;

      if (amountPaid > totalAmount) {
        // Calculate change if customer paid more than needed
        changeGiven = amountPaid - totalAmount;
        amountDue = 0;
        paymentStatus = PaymentStatus.PAID;
      } else if (amountPaid === totalAmount) {
        // Exact payment
        amountDue = 0;
        paymentStatus = PaymentStatus.PAID;
      } else if (amountPaid > 0) {
        // Partial payment
        amountDue = totalAmount - amountPaid;
        paymentStatus = PaymentStatus.PARTIAL;
      } else {
        // No payment
        amountDue = totalAmount;
        paymentStatus = PaymentStatus.PENDING;
      }
    } else {
      // Default values if amount paid is not provided
      paymentStatus = PaymentStatus.PENDING;
      finalAmountPaid = 0;
      amountDue = totalAmount;
    }

    return {
      paymentStatus,
      amountPaid: finalAmountPaid,
      amountDue,
      changeGiven,
    };
  }
}

export const ordersService = new OrdersService();
