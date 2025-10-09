import { eq } from "drizzle-orm";
import { drizzleDb } from "../../../db";
import { orders } from "../../../db/schemas/orders.schema";

import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { DatabaseSchema, orderItems } from "../../../db/schemas";
import { OrderDto } from "../types/order.types";

export class OrdersRepository {
  /**
   * Create a new order in PENDING status
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
        orderDate: now,
        orderNumber,
        createdAt: now,
        updatedAt: now,
      })
      .execute();

    return data.id;
  }

  /**
   * Find order by ID with items
   */
  async findById(
    id: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<OrderDto | null> {
    const [order] = await (manager ?? drizzleDb)
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .limit(1);

    if (!order) {
      return null;
    }

    return {
      ...order.orders,
      items: order.order_items,
    } as any as OrderDto;
  }

  /**
   * Update order
   */
  async updateOrder(
    id: string,
    data: Partial<OrderDto>,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
      orderDate: data.orderDate ? data.orderDate : undefined,
      completedAt: data.completedAt ? data.completedAt : undefined,
    };

    await (manager ?? drizzleDb)
      .update(orders)
      .set(updateData)
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

export const ordersRepository = new OrdersRepository();
