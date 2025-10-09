import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { inject, injectable } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { DatabaseSchema } from "../../../db/schemas";
import { InventoryAdjustmentType } from "../enums/inventory-adjustment-type.enum";
import { InventoryReferenceType } from "../enums/inventory-reference-type";
import { InventoryRepository } from "../repository/inventory.repository";
import {
  ConsumeStockParams,
  InventoryDto,
  ReleaseStockParams,
  ReserveStockParams,
  ReturnStockParams,
} from "../types/inventory.types";

@injectable()
export class InventoryService {
  constructor(
    @inject(InventoryRepository)
    private readonly inventoryRepository: InventoryRepository
  ) {}

  /**
   * Find inventory by variant and store
   */
  async findByVariantAndStore(
    variantId: string,
    storeId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<InventoryDto | null> {
    return this.inventoryRepository.findByVariantAndStore(
      variantId,
      storeId,
      manager
    );
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

    // Get current inventory
    const item = await this.inventoryRepository.findByVariantAndStore(
      variantId,
      storeId,
      manager
    );

    if (!item) {
      throw new Error(
        `Inventory not found for variant ${variantId} in store ${storeId}`
      );
    }

    // Validate available stock
    if (item.quantityAvailable < quantity) {
      throw new Error(
        `Insufficient stock. Available: ${item.quantityAvailable}, Requested: ${quantity}`
      );
    }

    // Calculate new quantities
    const newCommitted = item.quantityCommitted + quantity;
    const newAvailable = item.quantityOnHand - newCommitted;

    console.log("Updating inventory for variant", {
      quantityCommitted: newCommitted,
      quantityAvailable: newAvailable,
      id: item.id,
      quantityOnHand: item.quantityOnHand,
      variantId,
      tenantId,
    });

    // Update inventory
    await this.inventoryRepository.updateQuantities(
      item.id,
      {
        quantityCommitted: newCommitted,
        quantityAvailable: newAvailable,
      },
      manager
    );

    // Create adjustment record
    await this.inventoryRepository.createAdjustment(
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
    params: ConsumeStockParams,
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

    // Get current inventory
    const item = await this.inventoryRepository.findByVariantAndStore(
      variantId,
      storeId,
      manager
    );

    if (!item) {
      throw new Error(
        `Inventory not found for variant ${variantId} in store ${storeId}`
      );
    }

    // Validate committed stock
    if (item.quantityCommitted < quantity) {
      throw new Error(
        `Insufficient committed stock. Committed: ${item.quantityCommitted}, Requested: ${quantity}`
      );
    }

    // Calculate new quantities
    const newOnHand = item.quantityOnHand - quantity;
    const newCommitted = item.quantityCommitted - quantity;
    const newAvailable = newOnHand - newCommitted;
    const newTotalValue = item.costPerUnit
      ? newOnHand * item.costPerUnit
      : item.totalValue;

    // Update inventory
    await this.inventoryRepository.updateQuantities(
      item.id,
      {
        quantityOnHand: newOnHand,
        quantityCommitted: newCommitted,
        quantityAvailable: newAvailable,
        totalValue: newTotalValue,
      },
      manager
    );

    // Create adjustment record
    await this.inventoryRepository.createAdjustment(
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
    params: ReleaseStockParams,
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

    // Get current inventory
    const item = await this.inventoryRepository.findByVariantAndStore(
      variantId,
      storeId,
      manager
    );

    if (!item) {
      throw new Error(
        `Inventory not found for variant ${variantId} in store ${storeId}`
      );
    }

    // Validate committed stock
    if (item.quantityCommitted < quantity) {
      throw new Error(
        `Insufficient committed stock. Committed: ${item.quantityCommitted}, Requested: ${quantity}`
      );
    }

    // Calculate new quantities
    const newCommitted = item.quantityCommitted - quantity;
    const newAvailable = item.quantityOnHand - newCommitted;

    // Update inventory
    await this.inventoryRepository.updateQuantities(
      item.id,
      {
        quantityCommitted: newCommitted,
        quantityAvailable: newAvailable,
      },
      manager
    );

    // Create adjustment record
    await this.inventoryRepository.createAdjustment(
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
    params: ReturnStockParams,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    const {
      variantId,
      storeId,
      quantity,
      referenceId,
      referenceType,
      currentUserId,
      tenantId,
      reason,
    } = params;

    // Validate quantity
    if (quantity <= 0) {
      throw new Error("Invalid quantity: must be greater than 0");
    }

    // Find or create inventory record
    let item = await this.inventoryRepository.findByVariantAndStore(
      variantId,
      storeId,
      manager
    );

    if (!item) {
      // Create new inventory record
      const id = uuidv4();
      await this.inventoryRepository.create(
        {
          id,
          tenantId,
          storeId,
          variantId,
          quantityOnHand: quantity,
          quantityCommitted: 0,
          quantityAvailable: quantity,
        },
        manager
      );

      item = (await this.inventoryRepository.findByVariantAndStore(
        variantId,
        storeId,
        manager
      ))!;
    } else {
      // Calculate new quantities
      const newOnHand = item.quantityOnHand + quantity;
      const newAvailable = newOnHand - item.quantityCommitted;
      const newTotalValue = item.costPerUnit
        ? newOnHand * item.costPerUnit
        : item.totalValue;

      // Update existing inventory
      await this.inventoryRepository.updateQuantities(
        item.id,
        {
          quantityOnHand: newOnHand,
          quantityAvailable: newAvailable,
          totalValue: newTotalValue,
        },
        manager
      );
    }

    // Create adjustment record
    await this.inventoryRepository.createAdjustment(
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
}
