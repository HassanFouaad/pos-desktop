import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { drizzleDb } from "../../../db";
import { returnItems } from "../../../db/schemas/return-items.schema";
import { ReturnItemDto } from "../types/return.types";

export class ReturnItemsRepository {
  /**
   * Create a new return item
   */
  async create(data: ReturnItemDto): Promise<ReturnItemDto> {
    const now = new Date();
    const id = uuidv4();

    const itemData = {
      id,
      storeId: data.storeId ?? "",
      returnId: data.returnId,
      tenantId: data.tenantId,
      originalOrderItemId: data.originalOrderItemId ?? "",
      quantityReturned: data.quantityReturned ?? 0,
      unitRefundAmount: data.unitRefundAmount ?? 0,
      totalRefundAmount: data.totalRefundAmount ?? 0,
      returnToInventory: data.returnToInventory ?? false,
      inventoryAdjustmentId: data.inventoryAdjustmentId ?? "",
      createdAt: now,
    };

    await drizzleDb.insert(returnItems).values(itemData);

    return this.findById(id) as Promise<ReturnItemDto>;
  }

  /**
   * Create multiple return items in bulk
   */
  async createBulk(items: ReturnItemDto[]): Promise<ReturnItemDto[]> {
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
      createdAt: now,
    }));

    await drizzleDb.insert(returnItems).values(itemsData);

    return Promise.all(
      itemsData.map((item) => this.findById(item.id) as Promise<ReturnItemDto>)
    );
  }

  /**
   * Find return item by ID
   */
  async findById(id: string): Promise<ReturnItemDto | null> {
    const items = await drizzleDb
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
      createdAt: new Date(item.createdAt!),
    } as ReturnItemDto;
  }

  /**
   * Find all return items for a return
   */
  async findByReturnId(returnId: string): Promise<ReturnItemDto[]> {
    const items = await drizzleDb
      .select()
      .from(returnItems)
      .where(eq(returnItems.returnId, returnId));

    return items.map((item) => ({
      ...item,
      returnToInventory: Boolean(item.returnToInventory),
      createdAt: new Date(item.createdAt!),
    })) as ReturnItemDto[];
  }

  /**
   * Count return items for a return
   */
  async countByReturnId(returnId: string): Promise<number> {
    const items = await this.findByReturnId(returnId);
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

export const returnItemsRepository = new ReturnItemsRepository();
