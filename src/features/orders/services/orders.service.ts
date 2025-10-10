import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { inject, injectable } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { drizzleDb } from "../../../db";
import {
  OrderItemStockType,
  OrderSource,
  OrderStatus,
  OrderType,
  PaymentStatus,
} from "../../../db/enums";
import { DatabaseSchema } from "../../../db/schemas";
import { CustomersService } from "../../customers/services/customers.service";
import { InventoryService } from "../../inventory/services/inventory.service";
import { StoresService } from "../../stores/services/stores.service";
import { UsersRepository } from "../../users/repositories/users.repository";
import { OrderHistoryRepository } from "../repositories/order-history.repository";
import { OrdersRepository } from "../repositories/orders.repository";
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
import { OrderItemsService } from "./order-items.service";

@injectable()
export class OrdersService {
  constructor(
    @inject(OrdersRepository)
    private readonly ordersRepository: OrdersRepository,
    @inject(OrderHistoryRepository)
    private readonly orderHistoryRepository: OrderHistoryRepository,
    @inject(OrderItemsService)
    private readonly orderItemsService: OrderItemsService,
    @inject(CustomersService)
    private readonly customersService: CustomersService,
    @inject(InventoryService)
    private readonly inventoryService: InventoryService,
    @inject(StoresService)
    private readonly storesService: StoresService,
    @inject(UsersRepository)
    private readonly usersRepository: UsersRepository
  ) {}
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
    const store = await this.storesService.getCurrentStore();
    if (!store) {
      throw new Error("Store not found");
    }

    // Get preview items with calculations
    const previewItems = await this.orderItemsService.previewOrderItems(
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
    const store = await this.storesService.getCurrentStore();
    if (!store) {
      throw new Error("Store not found");
    }

    const user = await this.usersRepository.getLoggedInUser();
    const tenant = await this.storesService.getCurrentTenant();
    const orderId = uuidv4();

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

      await drizzleDb.transaction(async (tx: any): Promise<string> => {
        // Create order with calculated totals
        await this.ordersRepository.createOrder(
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
            id: orderId,
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
            await this.inventoryService.reserveStock(
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

        await this.orderItemsService.createBulk(toCreateOrderItems, tx);
        // Create initial order history entry
        await this.orderHistoryRepository.create(
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
      });

      console.log("Order created with ID:", orderId);

      // Return the complete order with items
      const createdOrder = await this.ordersRepository.findById(orderId);
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
    const tenant = await this.storesService.getCurrentTenant();
    const order = await this.ordersRepository.findById(data.orderId);
    const user = await this.usersRepository.getLoggedInUser();

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error("Order must be in PENDING status to complete");
    }

    try {
      // Consume inventory for all stock items
      const items = await this.orderItemsService.findByOrderId(data.orderId);

      await drizzleDb.transaction(async (manager: any) => {
        // Update order status
        await this.ordersRepository.updateOrder(
          data.orderId,
          {
            status: OrderStatus.COMPLETED,
            completedAt: new Date(),
          },
          manager
        );

        for (const item of items) {
          if (
            item.stockType === OrderItemStockType.INVENTORY &&
            item.variantId
          ) {
            await this.inventoryService.consumeStock(
              {
                variantId: item.variantId,
                storeId: order.storeId,
                quantity: item.quantity,
                referenceId: data.orderId,
                currentUserId: user?.id as string,
                tenantId: tenant?.id ?? "",
              },
              manager
            );

            // Create order history entry for completion
            await this.orderHistoryRepository.create(
              {
                orderId: data.orderId,
                userId: user?.id,
                fromStatus: OrderStatus.PENDING,
                toStatus: OrderStatus.COMPLETED,
                storeId: order.storeId,
                tenantId: tenant?.id ?? "",
              },
              manager
            );
          }

          if (order.customerId) {
            await this.customersService.updateVisitData(
              order.customerId,
              order.totalAmount,
              manager
            );
          }
        }
      });

      return this.ordersRepository.findById(data.orderId) as Promise<OrderDto>;
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
    const tenant = await this.storesService.getCurrentTenant();
    const order = await this.ordersRepository.findById(data.orderId);
    const user = await this.usersRepository.getLoggedInUser();

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error("Only PENDING orders can be voided");
    }

    const items = await this.orderItemsService.findByOrderId(data.orderId);

    try {
      await drizzleDb.transaction(async (manager: any) => {
        // Update order status
        await this.ordersRepository.updateOrder(
          data.orderId,
          {
            status: OrderStatus.VOIDED,
          },
          manager
        );

        // Create order history entry for voiding
        await this.orderHistoryRepository.create(
          {
            orderId: data.orderId,
            userId: user?.id,
            fromStatus: OrderStatus.PENDING,
            toStatus: OrderStatus.VOIDED,
            storeId: order.storeId,
            tenantId: tenant?.id ?? "",
          },
          manager
        );
        // Release inventory for all stock items

        for (const item of items) {
          if (
            item.stockType === OrderItemStockType.INVENTORY &&
            item.variantId
          ) {
            await this.inventoryService.releaseStock(
              {
                variantId: item.variantId,
                storeId: order.storeId,
                quantity: item.quantity,
                referenceId: data.orderId,
                currentUserId: user?.id as string,
                tenantId: tenant?.id ?? "",
              },
              manager
            );
          }
        }
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
    return this.ordersRepository.findById(orderId);
  }

  /**
   * Get orders with optional search and pagination
   */
  async getOrders(
    searchTerm: string | undefined,
    limit: number,
    offset: number,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<OrderDto[]> {
    return this.ordersRepository.getOrders(searchTerm, limit, offset, manager);
  }

  async updateOrder(
    id: string,
    data: Partial<Omit<OrderDto, "id" | "createdAt" | "updatedAt" | "items">>,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    return this.ordersRepository.updateOrder(id, data, manager);
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
