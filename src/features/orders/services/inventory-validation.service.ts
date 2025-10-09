import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { DatabaseSchema } from "../../../db/schemas";
import { inventoryRepository } from "../../inventory/repository/inventory.repository";
import { OrderItemDto } from "../types/order.types";
import { CreateReturnItemDto, ValidationResult } from "../types/return.types";

export class InventoryValidationService {
  /**
   * Validate if a variant can be returned to inventory
   * @param storeId Store ID
   * @param variantId Product variant ID
   * @returns ValidationResult indicating if the variant can be returned to inventory
   */
  async validateReturnToInventory(
    storeId: string,
    variantId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<ValidationResult> {
    try {
      // Check if the variant exists in inventory for this store
      // We don't need to check if the variant exists separately because the inventory repository will do that
      try {
        // If no inventory record exists, we'll create one later during the return process
        await inventoryRepository.findByVariantAndStore(
          variantId,
          storeId,
          manager
        );

        // If we get here, the variant exists in inventory
        return { valid: true };
      } catch (error) {
        // If inventory record doesn't exist, we can still return to inventory (we'll create it)
        if ((error as any)?.message?.includes("not found")) {
          // The variant might exist but just doesn't have inventory yet
          // The InventoryRepository will validate variant existence when creating inventory
          return { valid: true };
        }

        throw error;
      }
    } catch (error) {
      // Any other error means validation failed
      return {
        valid: false,
        errors: [
          {
            itemId: "", // Generic error not tied to a specific item
            message: "Variant not found or cannot be returned to inventory",
          },
        ],
      };
    }
  }

  /**
   * Validate the return quantity
   * @param storeId Store ID
   * @param variantId Product variant ID
   * @param quantity Quantity to return
   * @returns ValidationResult
   */
  async validateReturnQuantity(
    storeId: string,
    variantId: string,
    quantity: number,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<ValidationResult> {
    // Validate quantity is positive
    if (quantity <= 0) {
      return {
        valid: false,
        errors: [
          {
            itemId: "", // Generic error not tied to a specific item
            message: "Invalid return quantity: must be greater than 0",
          },
        ],
      };
    }

    // Additional validation as needed
    return { valid: true };
  }

  /**
   * Validate a return item for inventory integration
   * @param storeId Store ID
   * @param itemDto Return item data
   * @param orderItem Original order item
   * @returns ValidationResult
   */
  async validateReturnItemInventory(
    storeId: string,
    itemDto: CreateReturnItemDto,
    orderItem: OrderItemDto,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<ValidationResult> {
    // If item is not returning to inventory, no validation needed
    if (!itemDto.returnToInventory) {
      return { valid: true };
    }

    // If no variant ID, can't return to inventory
    if (!orderItem.variantId) {
      return {
        valid: false,
        errors: [
          {
            itemId: itemDto.originalOrderItemId,
            message: "Cannot return to inventory: no variant ID",
          },
        ],
      };
    }

    // Validate inventory return capability
    const inventoryValidation = await this.validateReturnToInventory(
      storeId,
      orderItem.variantId,
      manager
    );

    if (!inventoryValidation.valid) {
      return {
        valid: false,
        errors: inventoryValidation.errors
          ? inventoryValidation.errors.map((error) => ({
              itemId: itemDto.originalOrderItemId,
              message: error.message,
            }))
          : [],
      };
    }

    // Validate return quantity
    const quantityValidation = await this.validateReturnQuantity(
      storeId,
      orderItem.variantId,
      itemDto.quantityReturned,
      manager
    );

    if (!quantityValidation.valid) {
      return {
        valid: false,
        errors: quantityValidation.errors
          ? quantityValidation.errors.map((error) => ({
              itemId: itemDto.originalOrderItemId,
              message: error.message,
            }))
          : [],
      };
    }

    return { valid: true };
  }
}

export const inventoryValidationService = new InventoryValidationService();
