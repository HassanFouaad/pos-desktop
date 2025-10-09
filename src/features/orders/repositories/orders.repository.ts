import { eq } from "drizzle-orm";
import { drizzleDb } from "../../../db";
import { orders } from "../../../db/schemas/orders.schema";

import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { container } from "tsyringe";
import { DatabaseSchema, orderItems } from "../../../db/schemas";
import { OrderDto } from "../types/order.types";

export class OrdersRepository {
  /**
   * Create a new order
   */
  async createOrder(
    data: typeof orders.$inferInsert,
    storeCode: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<string> {
    const now = new Date();

    // Generate order number (will be replaced with server number on sync)
    const orderNumber = this.generateOrderNumber(storeCode);

    await (manager ?? drizzleDb)
      .insert(orders)
      .values({
        ...data,
        orderDate: data.orderDate || now,
        orderNumber,
        createdAt: now,
        updatedAt: now,
      })
      .execute();

    return data.id;
  }

  /**
   * Find order by ID
   */
  async findById(
    id: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<OrderDto | null> {
    const result = await (manager ?? drizzleDb)
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!result || result.length === 0) {
      return null;
    }

    const order = result[0];

    // Get order items separately
    const items = await (manager ?? drizzleDb)
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return {
      ...order,
      orderDate: new Date(order.orderDate!),
      completedAt: order.completedAt ? new Date(order.completedAt) : undefined,
      createdAt: new Date(order.createdAt!),
      updatedAt: new Date(order.updatedAt!),
      items: items.map((item) => ({
        ...item,
        variantAttributes: item.variantAttributes as
          | Record<string, string>
          | undefined,
        isReturned: Boolean(item.isReturned),
        createdAt: new Date(item.createdAt!),
        updatedAt: new Date(item.updatedAt!),
      })),
    } as OrderDto;
  }

  /**
   * Update order
   */
  async updateOrder(
    id: string,
    data: Partial<Omit<OrderDto, "id" | "createdAt" | "updatedAt" | "items">>,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    await (manager ?? drizzleDb)
      .update(orders)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));
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
}

container.registerSingleton(OrdersRepository);

export const ordersRepository = new OrdersRepository();
