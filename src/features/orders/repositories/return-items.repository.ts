import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { eq } from "drizzle-orm";
import { singleton } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { drizzleDb } from "../../../db";
import { DatabaseSchema } from "../../../db/schemas";
import { returnItems } from "../../../db/schemas/return-items.schema";
import { ReturnItemDto } from "../types/return.types";

@singleton()
export class ReturnItemsRepository {
  /**
   * Create a new return item
   */
  async create(
    data: Omit<ReturnItemDto, "id" | "createdAt">,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<ReturnItemDto> {
    const now = new Date();
    const id = uuidv4();

    const itemData = {
      id,
      storeId: data.storeId,
      returnId: data.returnId,
      tenantId: data.tenantId,
      originalOrderItemId: data.originalOrderItemId,
      quantityReturned: data.quantityReturned,
      unitRefundAmount: data.unitRefundAmount,
      totalRefundAmount: data.totalRefundAmount,
      returnToInventory: data.returnToInventory,
      inventoryAdjustmentId: data.inventoryAdjustmentId,
      createdAt: now.toISOString(),
    };

    await (manager ?? drizzleDb).insert(returnItems).values(itemData);

    return (await this.findById(id, manager))!;
  }

  /**
   * Create multiple return items in bulk
   */
  async createBulk(
    items: Omit<ReturnItemDto, "id" | "createdAt">[],
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<ReturnItemDto[]> {
    const now = new Date();

    const itemsData = items.map((item) => ({
      id: uuidv4(),
      storeId: item.storeId,
      returnId: item.returnId,
      originalOrderItemId: item.originalOrderItemId,
      tenantId: item.tenantId,
      quantityReturned: item.quantityReturned,
      unitRefundAmount: item.unitRefundAmount,
      totalRefundAmount: item.totalRefundAmount,
      returnToInventory: item.returnToInventory,
      inventoryAdjustmentId: item.inventoryAdjustmentId,
      createdAt: now.toISOString(),
    }));

    await (manager ?? drizzleDb).insert(returnItems).values(itemsData);

    return Promise.all(
      itemsData.map(
        (item) => this.findById(item.id, manager) as Promise<ReturnItemDto>
      )
    );
  }

  /**
   * Find return item by ID
   */
  async findById(
    id: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<ReturnItemDto | null> {
    const items = await (manager ?? drizzleDb)
      .select()
      .from(returnItems)
      .where(eq(returnItems.id, id))
      .limit(1);

    if (!items || items.length === 0) {
      return null;
    }

    const item = items[0];
    return {
      ...item,
      returnToInventory: Boolean(item.returnToInventory),
      createdAt: new Date(item.createdAt!) as any,
    } as ReturnItemDto;
  }

  /**
   * Find all return items for a return
   */
  async findByReturnId(
    returnId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<ReturnItemDto[]> {
    const items = await (manager ?? drizzleDb)
      .select()
      .from(returnItems)
      .where(eq(returnItems.returnId, returnId));

    return items.map((item) => ({
      ...item,
      returnToInventory: Boolean(item.returnToInventory),
      createdAt: new Date(item.createdAt!) as any,
    })) as ReturnItemDto[];
  }

  /**
   * Count return items for a return
   */
  async countByReturnId(
    returnId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<number> {
    const items = await this.findByReturnId(returnId, manager);
    return items.length;
  }

  /**
   * Calculate total refund amount for return items
   */
  calculateTotalRefundAmount(
    returnItems: { quantityReturned: number; unitRefundAmount: number }[]
  ): number {
    return returnItems.reduce(
      (total, item) => total + item.quantityReturned * item.unitRefundAmount,
      0
    );
  }
}
