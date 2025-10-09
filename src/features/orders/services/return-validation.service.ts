import { container, inject } from "tsyringe";
import { OrderStatus } from "../../../db/enums";
import { OrderDto } from "../types/order.types";
import {
  CreateReturnDto,
  CreateReturnItemDto,
  ReturnEligibilityDto,
  ValidationErrorItem,
  ValidationResult,
} from "../types/return.types";
import { InventoryValidationService } from "./inventory-validation.service";

export class ReturnValidationService {
  // Default return window in days - could be moved to tenant configuration in the future
  private readonly DEFAULT_RETURN_WINDOW_DAYS = 30;

  constructor(
    @inject(InventoryValidationService)
    private readonly inventoryValidationService: InventoryValidationService
  ) {}
  /**
   * Validate if an order is eligible for return
   * @param order Order to check for return eligibility
   * @returns ReturnEligibilityDto with eligibility status and reason if not eligible
   */
  async validateReturnEligibility(
    order: OrderDto
  ): Promise<ReturnEligibilityDto> {
    // Check if order is completed
    if (order.status !== OrderStatus.COMPLETED) {
      return {
        eligible: false,
        reason: "Order must be completed before it can be returned",
        order,
      };
    }

    // Check if order has items
    if (!order.items || order.items.length === 0) {
      return {
        eligible: false,
        reason: "Order has no items to return",
        order,
      };
    }

    // Check if all items are already returned
    const allItemsReturned = order.items.every(
      (item) => item.isReturned && item.returnedQuantity >= item.quantity
    );

    if (allItemsReturned) {
      return {
        eligible: false,
        reason: "All items in this order have already been returned",
        order,
      };
    }

    // Check return time window
    const orderDate = new Date(order.orderDate);
    const currentDate = new Date();
    const daysSinceOrder = Math.floor(
      (currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // In a production system, this would likely be configurable per tenant
    const returnWindowDays = this.DEFAULT_RETURN_WINDOW_DAYS;

    if (daysSinceOrder > returnWindowDays) {
      return {
        eligible: false,
        reason: `Return window has expired (${returnWindowDays} days)`,
        // Can still be returned with manager approval
        requiresApproval: true,
        order,
      };
    }

    // Basic validation passed
    return {
      eligible: true,
      order,
    };
  }

  /**
   * Validate return items against original order items
   * @param order Original order
   * @param items Return items to validate
   * @param storeId Store ID (optional)
   * @returns ValidationResult with validation status and errors if any
   */
  async validateReturnItems(
    order: OrderDto,
    items: CreateReturnItemDto[]
  ): Promise<ValidationResult> {
    const basicValidation = await this.validateReturnItemsBasic(order, items);
    if (!basicValidation.valid) {
      return basicValidation;
    }
    const storeId = order.storeId;
    const allErrors: ValidationErrorItem[] = [];

    if (storeId) {
      for (const item of items) {
        const orderItem = order.items?.find(
          (oi) => oi.id === item.originalOrderItemId
        );
        if (orderItem && item.returnToInventory) {
          const inventoryValidation =
            await this.inventoryValidationService.validateReturnItemInventory(
              storeId,
              item,
              orderItem
            );
          if (!inventoryValidation.valid && inventoryValidation.errors) {
            allErrors.push(...inventoryValidation.errors);
          }
        }
      }
    }

    if (allErrors.length > 0) {
      return { valid: false, errors: allErrors };
    }

    return { valid: true, errors: undefined };
  }

  /**
   * Basic validation of return items without inventory checks
   * @param order Original order
   * @param items Return items to validate
   * @returns ValidationResult with validation status and errors if any
   */
  private async validateReturnItemsBasic(
    order: OrderDto,
    items: CreateReturnItemDto[]
  ): Promise<ValidationResult> {
    // Fetch all order items
    const orderItems = order.items;

    // Create a map for faster lookup
    const orderItemsMap = new Map(orderItems?.map((item) => [item.id, item]));

    const errors: ValidationErrorItem[] = [];

    // Validate each return item
    for (const item of items) {
      const orderItem = orderItemsMap.get(item.originalOrderItemId);

      if (!orderItem) {
        errors.push({
          itemId: item.originalOrderItemId,
          message: "Order item not found",
        });
        continue;
      }

      // Check if item has already been fully returned
      if (
        orderItem.isReturned &&
        orderItem.returnedQuantity >= orderItem.quantity
      ) {
        errors.push({
          itemId: item.originalOrderItemId,
          message: "Item has already been fully returned",
        });
        continue;
      }

      // Calculate remaining quantity that can be returned
      const remainingQuantity = orderItem.quantity - orderItem.returnedQuantity;

      if (item.quantityReturned > remainingQuantity) {
        errors.push({
          itemId: item.originalOrderItemId,
          message: `Quantity exceeds available. Available: ${remainingQuantity}, Requested: ${item.quantityReturned}`,
        });
      }

      // Additional validation could be added here:
      // - Check if item is returnable based on product type
      // - Check for special restrictions on certain items
      // - Check for other business rules
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Determine if a return requires manager approval based on business rules
   * @param returnData Return data to evaluate
   * @returns boolean indicating if approval is required
   */
  checkApprovalRequired(returnData: CreateReturnDto): boolean {
    // This is a simplified implementation
    // In a real-world scenario, this would check against configurable policies

    // Check for high-value returns
    const HIGH_VALUE_THRESHOLD = 500; // Example threshold

    // The actual implementation would:
    // 1. Check return value against configurable threshold
    // 2. Check if return is outside standard window
    // 3. Check for multiple returns from same customer
    // 4. Check for suspicious return patterns
    // 5. Check if no receipt/proof of purchase

    // For Phase 1, we'll implement a simplified version
    // This would be expanded in later phases

    // For now, just return false as this functionality will be implemented later
    return false;
  }
}

container.registerSingleton(ReturnValidationService);
