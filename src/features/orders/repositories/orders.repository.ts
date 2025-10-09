import { and, desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { drizzleDb } from "../../../db";
import { orderItems } from "../../../db/schemas/order-items.schema";
import { orders } from "../../../db/schemas/orders.schema";

import {
  OrderSource,
  OrderStatus,
  OrderType,
  PaymentStatus,
} from "../../../db/enums";
import { OrderDto } from "../types/order.types";

export class OrdersRepository {
  /**
   * Create a new order in PENDING status
   */
  async createOrder(
    data: typeof orders.$inferInsert,
    storeCode: string
  ): Promise<string> {
    const now = new Date();
    const orderId = uuidv4();

    // Generate order number (will be replaced with server number on sync)
    const orderNumber = this.generateOrderNumber(storeCode);

    const orderData = {
      id: orderId,
      tenantId: data.tenantId,
      storeId: data.storeId,
      customerId: data.customerId,
      orderNumber,
      orderType: OrderType.SALE,
      status: OrderStatus.PENDING,
      source: OrderSource.POS,
      subtotal: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalAmount: 0,
      paymentStatus: PaymentStatus.PENDING,
      amountPaid: data.amountPaid || 0,
      amountDue: 0,
      changeGiven: 0,
      cashierId: data.cashierId,
      shiftId: data.shiftId,
      registerId: data.registerId,
      notes: data.notes,
      localId: orderId,
      orderDate: now,
      createdAt: now,
      updatedAt: now,
    };

    await drizzleDb.insert(orders).values(orderData).execute();

    return orderId;
  }

  /**
   * Find order by ID with items
   */
  async findById(id: string): Promise<OrderDto | null> {
    const order = await drizzleDb
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order || order.length === 0) {
      return null;
    }

    const items = await drizzleDb
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return {
      ...order[0],
      items: items.map((item) => ({
        ...item,
        variantAttributes: item.variantAttributes as
          | Record<string, string>
          | undefined,
        isReturned: Boolean(item.isReturned),
        createdAt: new Date(item.createdAt!),
        updatedAt: new Date(item.updatedAt!),
      })),
      orderDate: new Date(order[0].orderDate!),
      createdAt: new Date(order[0].createdAt!),
      updatedAt: new Date(order[0].updatedAt!),
      completedAt: order[0].completedAt
        ? new Date(order[0].completedAt)
        : undefined,
    } as OrderDto;
  }

  /**
   * Update order
   */
  async updateOrder(id: string, data: Partial<OrderDto>): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
      orderDate: data.orderDate ? data.orderDate : undefined,
      completedAt: data.completedAt ? data.completedAt : undefined,
    };

    await drizzleDb.update(orders).set(updateData).where(eq(orders.id, id));
  }

  /**
   * Delete order (for voided orders)
   */
  async deleteOrder(id: string): Promise<void> {
    // Delete order items first
    await drizzleDb.delete(orderItems).where(eq(orderItems.orderId, id));

    // Delete order
    await drizzleDb.delete(orders).where(eq(orders.id, id));
  }

  /**
   * Generate a unique order number
   * Format: POS-YYYYMMDD-XXXX
   */
  private generateOrderNumber(storeCode: string): string {
    // Generate 6 random numbers
    let numbers = "";
    for (let i = 0; i < 6; i++) {
      numbers += Math.floor(Math.random() * 10); // 0–9
    }

    return `SO-${storeCode}-${numbers}`;
  }

  /**
   * Get pending orders for current store
   */
  async getPendingOrders(storeId: string): Promise<OrderDto[]> {
    const pendingOrders = await drizzleDb
      .select()
      .from(orders)
      .where(
        and(eq(orders.storeId, storeId), eq(orders.status, OrderStatus.PENDING))
      )
      .orderBy(desc(orders.createdAt));

    return Promise.all(
      pendingOrders.map((order) => this.findById(order.id) as Promise<OrderDto>)
    );
  }
}

export const ordersRepository = new OrdersRepository();
