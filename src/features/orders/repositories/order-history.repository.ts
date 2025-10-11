import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { desc, eq } from "drizzle-orm";
import { singleton } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { drizzleDb } from "../../../db";
import { DatabaseSchema } from "../../../db/schemas";
import { orderHistory } from "../../../db/schemas/order-history.schema";
import { CreateOrderHistoryDto, OrderHistoryDto } from "../types/order.types";

@singleton()
export class OrderHistoryRepository {
  /**
   * Create a new order history entry
   */
  async create(
    data: CreateOrderHistoryDto,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    const now = new Date();
    const id = uuidv4();

    const historyData = {
      id,
      ...data,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await (manager ?? drizzleDb).insert(orderHistory).values(historyData);
  }

  /**
   * Find order history by ID
   */
  async findById(
    id: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<OrderHistoryDto | null> {
    const history = await (manager ?? drizzleDb)
      .select()
      .from(orderHistory)
      .where(eq(orderHistory.id, id))
      .limit(1);

    if (!history || history.length === 0) {
      return null;
    }

    const item = history[0];
    return {
      ...item,
      createdAt: new Date(item.createdAt!) as any,
      updatedAt: new Date(item.updatedAt!) as any,
    } as OrderHistoryDto;
  }

  /**
   * Find all history entries for an order
   */
  async findByOrderId(
    orderId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<OrderHistoryDto[]> {
    const history = await (manager ?? drizzleDb)
      .select()
      .from(orderHistory)
      .where(eq(orderHistory.orderId, orderId))
      .orderBy(desc(orderHistory.createdAt));

    return history.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt!) as any,
      updatedAt: new Date(item.updatedAt!) as any,
    })) as OrderHistoryDto[];
  }
}
