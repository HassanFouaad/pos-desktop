import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { and, eq } from "drizzle-orm";
import { singleton } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { drizzleDb } from "../../../db";
import { DatabaseSchema } from "../../../db/schemas";
import { inventoryAdjustments } from "../../../db/schemas/inventory-adjustments.schema";
import { inventory } from "../../../db/schemas/inventory.schema";
import {
  CreateInventoryAdjustmentDto,
  InventoryDto,
} from "../types/inventory.types";

@singleton()
export class InventoryRepository {
  /**
   * Find inventory by variant and store
   */
  async findByVariantAndStore(
    variantId: string,
    storeId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<InventoryDto | null> {
    const items = await (manager ?? drizzleDb)
      .select()
      .from(inventory)
      .where(
        and(eq(inventory.variantId, variantId), eq(inventory.storeId, storeId))
      )
      .limit(1);

    if (!items || items.length === 0) {
      return null;
    }

    const item = items[0];
    return {
      ...item,
      createdAt: new Date(item.createdAt!) as any,
      updatedAt: new Date(item.updatedAt!),
    } as InventoryDto;
  }

  /**
   * Update inventory quantities
   */
  async updateQuantities(
    inventoryId: string,
    quantities: {
      quantityOnHand?: number;
      quantityCommitted?: number;
      quantityAvailable?: number;
      totalValue?: number;
    },
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    await (manager ?? drizzleDb)
      .update(inventory)
      .set({
        ...quantities,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(inventory.id, inventoryId));
  }

  /**
   * Create inventory record
   */
  async create(
    data: {
      id: string;
      tenantId: string;
      storeId: string;
      variantId: string;
      quantityOnHand: number;
      quantityCommitted: number;
      quantityAvailable: number;
      costPerUnit?: number;
      totalValue?: number;
    },
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    const now = new Date();
    await (manager ?? drizzleDb).insert(inventory).values({
      ...data,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  /**
   * Create inventory adjustment record
   */
  async createAdjustment(
    data: CreateInventoryAdjustmentDto,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    const now = new Date();

    await (manager ?? drizzleDb).insert(inventoryAdjustments).values({
      id: uuidv4(),
      tenantId: data.tenantId,
      storeId: data.storeId,
      variantId: data.variantId,
      adjustmentType: data.adjustmentType,
      quantityChange: data.quantityChange,
      quantityBefore: data.quantityBefore,
      quantityAfter: data.quantityAfter,
      unitCost: data.unitCost,
      totalCost: data.totalCost,
      reason: data.reason,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      adjustedBy: data.adjustedBy,
      adjustedAt:
        new Date(data.adjustedAt ?? new Date()).toISOString() ||
        now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }
}
