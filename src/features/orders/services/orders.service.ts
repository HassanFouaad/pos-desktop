import { v4 as uuidv4 } from "uuid";
import { drizzleDb } from "../../../db";
import {
  OrderItemStockType,
  OrderStatus,
  PaymentStatus,
} from "../../../db/enums";
import { inventoryRepository } from "../../inventory/repository/inventory.repository";
import { storesRepository } from "../../stores/repositories/stores.repository";
import { usersRepository } from "../../users/repositories/users.repository";
import { orderItemsRepository } from "../repositories/order-items.repository";
import { ordersRepository } from "../repositories/orders.repository";
import {
  CompleteOrderDto,
  CreateOrderDto,
  CreateOrderItemDto,
  OrderDto,
  PreviewOrderDto,
  VoidOrderDto,
} from "../types/order.types";
import { orderItemsService } from "./order-items.service";

export class OrdersService {
  /**
   * Create a new order in PENDING status with items and inventory reservation
   * This matches the backend logic exactly
   */
  async createOrder(data: CreateOrderDto): Promise<OrderDto> {
    console.log("Creating order with data", data);
    // Validate that we have items
    if (!data.items || data.items.length === 0) {
      console.error("Cannot create order without items");
      throw new Error("Cannot create order without items");
    }
    const user = await usersRepository.getLoggedInUser();
    const tenant = await storesRepository.getCurrentTenant();
    const store = await storesRepository.getCurrentStore();
    const localId = uuidv4();
    console.log("Getting preview for order");
    // Get preview to calculate totals
    const preview = await this.previewOrder(data.items, data.storeId);
    const orderId = await drizzleDb.transaction(
      async (tx): Promise<string> => {
        try {
          console.log("Creating order with calculated totals");
          // Create order with calculated totals
          const orderId = await ordersRepository.createOrder(
            {
              ...data,
              tenantId: tenant?.id ?? "",
              subtotal: preview.subtotal,
              totalDiscount: preview.totalDiscount,
              totalTax: preview.totalTax,
              totalAmount: preview.totalAmount,
              amountPaid: 0,
              amountDue: preview.totalAmount,
              changeGiven: 0,
              id: localId,
              localId: localId,
            },
            store?.code ?? ""
          );

          console.log("Order updated with calculated totals");

          // Create order items
          for (const previewItem of preview.items) {
            await orderItemsRepository.createItem({
              orderId: orderId,
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
            });

            console.log("Order item created");

            // Reserve inventory for stock items
            if (
              previewItem.stockType === OrderItemStockType.INVENTORY &&
              previewItem.variantId
            ) {
              console.log("Reserving inventory for stock item");
              await inventoryRepository.reserveStock(
                previewItem.variantId,
                data.storeId,
                previewItem.quantity,
                orderId,
                user?.id as string,
                tenant?.id ?? ""
              );
            }
          }

          return orderId;
        } catch (error) {
          console.error("error creating order", error);
          throw error;
        }
      },
      {
        accessMode: "read write",
      }
    );

    // Return the complete order with items
    return ordersRepository.findById(orderId) as Promise<OrderDto>;
  }

  /**
   * Preview order with real-time calculations
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

    // Get preview items with calculations
    const previewItems = await orderItemsService.previewOrderItems(
      items,
      storeId
    );

    // Calculate order totals
    const subtotal = previewItems.reduce(
      (sum, item) => sum + item.lineSubtotal,
      0
    );
    const totalDiscount = previewItems.reduce(
      (sum, item) => sum + item.lineDiscount,
      0
    );
    const totalTax = previewItems.reduce((sum, item) => sum + item.lineTax, 0);
    const totalAmount = previewItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );

    return {
      items: previewItems,
      subtotal,
      totalDiscount,
      totalTax,
      totalAmount,
    };
  }

  /**
   * Complete order - consume inventory and finalize
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

    return ordersRepository.findById(data.orderId) as Promise<OrderDto>;
  }

  /**
   * Void order - release all reserved inventory
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
  }

  /**
   * Update order payment information
   */
  async updateOrderPayment(
    orderId: string,
    paymentData: {
      amountPaid: number;
      paymentMethod: string;
    }
  ): Promise<void> {
    await ordersRepository.updateOrder(orderId, {
      amountPaid: paymentData.amountPaid,
      paymentMethod: paymentData.paymentMethod as any,
    });
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<OrderDto | null> {
    return ordersRepository.findById(orderId);
  }

  /**
   * Get pending orders for store
   */
  async getPendingOrders(storeId: string): Promise<OrderDto[]> {
    return ordersRepository.getPendingOrders(storeId);
  }
}

export const ordersService = new OrdersService();
