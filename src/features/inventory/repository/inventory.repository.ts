import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { drizzleDb } from "../../../db";
import { inventoryAdjustments } from "../../../db/schemas/inventory-adjustments.schema";
import { inventory } from "../../../db/schemas/inventory.schema";
import { InventoryAdjustmentType } from "../enums/inventory-adjustment-type.enum";
import { InventoryReferenceType } from "../enums/inventory-reference-type";

export interface InventoryDto {
  id: string;
  tenantId?: string;
  storeId: string;
  variantId: string;
  quantityOnHand: number;
  quantityCommitted: number;
  quantityAvailable: number;
  reorderPoint?: number;
  maxStockLevel?: number;
  costPerUnit?: number;
  totalValue?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInventoryAdjustmentData {
  tenantId: string;
  storeId: string;
  variantId: string;
  adjustmentType: string;
  quantityChange: number;
  quantityBefore?: number;
  quantityAfter?: number;
  unitCost?: number;
  totalCost?: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  adjustedBy?: string;
  adjustedAt?: Date;
}

export class InventoryRepository {
  /**
   * Find inventory by variant and store
   */
  async findByVariantAndStore(
    variantId: string,
    storeId: string
  ): Promise<InventoryDto | null> {
    const items = await drizzleDb
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
    variantId: string,
    storeId: string,
    quantity: number,
    referenceId: string,
    currentUserId: string,
    tenantId: string
  ): Promise<void> {
    console.log("Reserving stock for variant", variantId);
    const item = await this.findByVariantAndStore(variantId, storeId);

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
    await drizzleDb
      .update(inventory)
      .set({
        quantityCommitted: newCommitted,
        quantityAvailable: newAvailable,
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, item.id));

    // Create adjustment record
    await this.createAdjustment({
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
    });
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
    tenantId: string
  ): Promise<void> {
    const item = await this.findByVariantAndStore(variantId, storeId);

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

    await drizzleDb
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
    await this.createAdjustment({
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
    });
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
    tenantId: string
  ): Promise<void> {
    const item = await this.findByVariantAndStore(variantId, storeId);

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

    await drizzleDb
      .update(inventory)
      .set({
        quantityCommitted: newCommitted,
        quantityAvailable: newAvailable,
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, item.id));

    // Create adjustment record
    await this.createAdjustment({
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
    });
  }

  /**
   * Create inventory adjustment record
   */
  private async createAdjustment(
    data: CreateInventoryAdjustmentData
  ): Promise<void> {
    const now = new Date();

    await drizzleDb.insert(inventoryAdjustments).values({
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
