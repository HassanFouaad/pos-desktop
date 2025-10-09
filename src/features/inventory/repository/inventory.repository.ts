import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { drizzleDb } from "../../../db";
import { DatabaseSchema } from "../../../db/schemas";
import { inventoryAdjustments } from "../../../db/schemas/inventory-adjustments.schema";
import { inventory } from "../../../db/schemas/inventory.schema";
import { InventoryAdjustmentType } from "../enums/inventory-adjustment-type.enum";
import { InventoryReferenceType } from "../enums/inventory-reference-type";
import {
  CreateInventoryAdjustmentDto,
  InventoryDto,
  ReserveStockParams,
} from "../types/inventory.types";

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
      createdAt: new Date(item.createdAt!),
      updatedAt: new Date(item.updatedAt!),
    } as InventoryDto;
  }

  /**
   * Reserve stock (increase committed quantity)
   * Used when adding items to order
   */
  async reserveStock(
    params: ReserveStockParams,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    const {
      variantId,
      storeId,
      quantity,
      referenceId,
      currentUserId,
      tenantId,
    } = params;
    console.log("Reserving stock for variant", variantId);
    const item = await this.findByVariantAndStore(variantId, storeId, manager);

    if (!item) {
      throw new Error(
        `Inventory not found for variant ${variantId} in store ${storeId}`
      );
    }

    if (item.quantityAvailable < quantity) {
      throw new Error(
        `Insufficient stock. Available: ${item.quantityAvailable}, Requested: ${quantity}`
      );
    }

    // Update committed quantity
    const newCommitted = item.quantityCommitted + quantity;
    const newAvailable = item.quantityOnHand - newCommitted;

    console.log("Updating inventory for variant", {
      quantityCommitted: newCommitted,
      quantityAvailable: newAvailable,
      updatedAt: new Date(),
      id: item.id,
      quantityOnHand: item.quantityOnHand,
      variantId,
      tenantId,
    });

    await (manager ?? drizzleDb)
      .update(inventory)
      .set({
        quantityCommitted: newCommitted,
        quantityAvailable: newAvailable,
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, item.id));

    // Create adjustment record
    await this.createAdjustment(
      {
        tenantId,
        storeId,
        variantId,
        adjustmentType: InventoryAdjustmentType.SALE,
        quantityChange: 0, // Physical quantity doesn't change
        quantityBefore: item.quantityOnHand,
        quantityAfter: item.quantityOnHand,
        reason: `Stock reserved for order ${referenceId}`,
        referenceType: InventoryReferenceType.ORDER,
        referenceId,
        adjustedAt: new Date(),
        adjustedBy: currentUserId,
      },
      manager
    );
  }

  /**
   * Consume stock (decrease both on-hand and committed)
   * Used when completing an order
   */
  async consumeStock(
    variantId: string,
    storeId: string,
    quantity: number,
    referenceId: string,
    currentUserId: string,
    tenantId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    const item = await this.findByVariantAndStore(variantId, storeId, manager);

    if (!item) {
      throw new Error(
        `Inventory not found for variant ${variantId} in store ${storeId}`
      );
    }

    if (item.quantityCommitted < quantity) {
      throw new Error(
        `Insufficient committed stock. Committed: ${item.quantityCommitted}, Requested: ${quantity}`
      );
    }

    // Update both on-hand and committed
    const newOnHand = item.quantityOnHand - quantity;
    const newCommitted = item.quantityCommitted - quantity;
    const newAvailable = newOnHand - newCommitted;

    await (manager ?? drizzleDb)
      .update(inventory)
      .set({
        quantityOnHand: newOnHand,
        quantityCommitted: newCommitted,
        quantityAvailable: newAvailable,
        totalValue: item.costPerUnit
          ? newOnHand * item.costPerUnit
          : item.totalValue,
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, item.id));

    // Create adjustment record
    await this.createAdjustment(
      {
        tenantId,
        storeId,
        variantId,
        adjustmentType: InventoryAdjustmentType.SALE,
        quantityChange: -quantity,
        quantityBefore: item.quantityOnHand,
        quantityAfter: newOnHand,
        unitCost: item.costPerUnit,
        totalCost: item.costPerUnit ? quantity * item.costPerUnit : undefined,
        reason: `Stock consumed for order ${referenceId}`,
        referenceType: InventoryReferenceType.ORDER,
        referenceId,
        adjustedAt: new Date(),
        adjustedBy: currentUserId,
      },
      manager
    );
  }

  /**
   * Release stock (decrease committed quantity)
   * Used when voiding an order
   */
  async releaseStock(
    variantId: string,
    storeId: string,
    quantity: number,
    referenceId: string,
    currentUserId: string,
    tenantId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    const item = await this.findByVariantAndStore(variantId, storeId, manager);

    if (!item) {
      throw new Error(
        `Inventory not found for variant ${variantId} in store ${storeId}`
      );
    }

    if (item.quantityCommitted < quantity) {
      throw new Error(
        `Insufficient committed stock. Committed: ${item.quantityCommitted}, Requested: ${quantity}`
      );
    }

    // Update committed quantity
    const newCommitted = item.quantityCommitted - quantity;
    const newAvailable = item.quantityOnHand - newCommitted;

    await (manager ?? drizzleDb)
      .update(inventory)
      .set({
        quantityCommitted: newCommitted,
        quantityAvailable: newAvailable,
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, item.id));

    // Create adjustment record
    await this.createAdjustment(
      {
        tenantId,
        storeId,
        variantId,
        adjustmentType: InventoryAdjustmentType.RELEASE,
        quantityChange: 0, // Physical quantity doesn't change
        quantityBefore: item.quantityOnHand,
        quantityAfter: item.quantityOnHand,
        reason: `Stock released from voided order ${referenceId}`,
        referenceType: InventoryReferenceType.ORDER,
        referenceId,
        adjustedAt: new Date(),
        adjustedBy: currentUserId,
      },
      manager
    );
  }

  /**
   * Return stock to inventory (increase on-hand quantity)
   * Used when processing returns
   */
  async returnStock(
    variantId: string,
    storeId: string,
    quantity: number,
    referenceId: string,
    referenceType: string,
    currentUserId: string,
    tenantId: string,
    reason?: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    if (quantity <= 0) {
      throw new Error("Invalid quantity: must be greater than 0");
    }

    // Find or create inventory record
    let item = await this.findByVariantAndStore(variantId, storeId, manager);

    if (!item) {
      // Create inventory record if it doesn't exist
      const now = new Date();
      const id = uuidv4();

      await (manager ?? drizzleDb).insert(inventory).values({
        id,
        tenantId,
        storeId,
        variantId,
        quantityOnHand: quantity,
        quantityCommitted: 0,
        quantityAvailable: quantity,
        createdAt: now,
        updatedAt: now,
      });

      item = (await this.findByVariantAndStore(variantId, storeId, manager))!;
    } else {
      // Update existing inventory
      const newOnHand = item.quantityOnHand + quantity;
      const newAvailable = newOnHand - item.quantityCommitted;

      await (manager ?? drizzleDb)
        .update(inventory)
        .set({
          quantityOnHand: newOnHand,
          quantityAvailable: newAvailable,
          totalValue: item.costPerUnit
            ? newOnHand * item.costPerUnit
            : item.totalValue,
          updatedAt: new Date(),
        })
        .where(eq(inventory.id, item.id));
    }

    // Create adjustment record
    await this.createAdjustment(
      {
        tenantId,
        storeId,
        variantId,
        adjustmentType: InventoryAdjustmentType.RETURN,
        quantityChange: quantity,
        quantityBefore: item.quantityOnHand,
        quantityAfter: item.quantityOnHand + quantity,
        unitCost: item.costPerUnit,
        totalCost: item.costPerUnit ? quantity * item.costPerUnit : undefined,
        reason: reason || `Stock returned from ${referenceType} ${referenceId}`,
        referenceType,
        referenceId,
        adjustedAt: new Date(),
        adjustedBy: currentUserId,
      },
      manager
    );
  }

  /**
   * Create inventory adjustment record
   */
  private async createAdjustment(
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
      adjustedAt: data.adjustedAt || now,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export const inventoryRepository = new InventoryRepository();
