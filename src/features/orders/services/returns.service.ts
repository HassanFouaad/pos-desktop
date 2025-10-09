import { inject, injectable } from "tsyringe";
import { OrderStatus } from "../../../db/enums";
import { InventoryReferenceType } from "../../inventory/enums/inventory-reference-type";
import { InventoryService } from "../../inventory/services/inventory.service";
import { StoresService } from "../../stores/services/stores.service";
import { OrderItemsRepository } from "../repositories/order-items.repository";
import { OrdersRepository } from "../repositories/orders.repository";
import { ReturnItemsRepository } from "../repositories/return-items.repository";
import { ReturnsRepository } from "../repositories/returns.repository";
import { OrderItemDto } from "../types/order.types";
import {
  ApproveReturnDto,
  CreateReturnDto,
  ProcessReturnDto,
  ReturnDto,
  ReturnItemDto,
} from "../types/return.types";
import { RefundService } from "./refund.service";
import { ReturnValidationService } from "./return-validation.service";

@injectable()
export class ReturnsService {
  constructor(
    @inject(ReturnsRepository)
    private readonly returnsRepository: ReturnsRepository,
    @inject(ReturnItemsRepository)
    private readonly returnItemsRepository: ReturnItemsRepository,
    @inject(OrderItemsRepository)
    private readonly orderItemsRepository: OrderItemsRepository,
    @inject(OrdersRepository)
    private readonly ordersRepository: OrdersRepository,
    @inject(InventoryService)
    private readonly inventoryService: InventoryService,
    @inject(RefundService)
    private readonly refundService: RefundService,
    @inject(ReturnValidationService)
    private readonly returnValidationService: ReturnValidationService,
    @inject(StoresService)
    private readonly storesService: StoresService
  ) {}
  /**
   * Find return by ID
   * @param id Return ID
   * @returns Return data if found
   * @throws Error if return not found
   */
  async findById(id: string): Promise<ReturnDto> {
    const returnRecord = await this.returnsRepository.findById(id);

    if (!returnRecord) {
      throw new Error("Return not found");
    }

    return returnRecord;
  }

  /**
   * Find returns for a specific original order
   * @param originalOrderId Original order ID
   * @returns Array of returns for the order
   */
  async findByOriginalOrderId(originalOrderId: string): Promise<ReturnDto[]> {
    return this.returnsRepository.findByOriginalOrderId(originalOrderId);
  }

  /**
   * Create a new return with validation
   * @param createDto Return creation data
   * @param userId ID of user creating the return
   * @param storeId Store ID for inventory integration (optional)
   * @returns Created return record
   */
  async create(createDto: CreateReturnDto, userId: string): Promise<ReturnDto> {
    // Fetch the original order with necessary details
    const originalOrder = await this.ordersRepository.findById(
      createDto.originalOrderId
    );

    if (!originalOrder) {
      throw new Error("Original order not found");
    }

    // Execute operations sequentially (PowerSync handles consistency)
    try {
      const tenant = await this.storesService.getCurrentTenant();

      // Create return record directly without creating an order
      const returnRecord = await this.returnsRepository.create({
        originalOrderId: originalOrder.id,
        storeId: originalOrder.storeId,
        tenantId: tenant?.id,
        returnType: createDto.returnType,
        returnReason: createDto.returnReason,
        processedBy: userId,
        requiresApproval:
          this.returnValidationService.checkApprovalRequired(createDto),
        refundMethod: createDto.refundMethod,
        refundAmount: 0, // Will be calculated based on items
        notes: createDto.notes,
      });

      // Process return items
      let totalRefundAmount = 0;

      // Get all order items in a single query for better performance
      const orderItems = await this.orderItemsRepository.findByOrderId(
        originalOrder.id
      );

      const orderItemsMap = new Map(orderItems.map((item) => [item.id, item]));

      // Prepare bulk operations for better performance
      const returnItemsToCreate = [];
      const orderItemsToUpdate: Array<{
        id: string;
        data: Partial<OrderItemDto>;
      }> = [];

      for (const itemDto of createDto.items) {
        // Find original order item from the map instead of querying each time
        const originalOrderItem = orderItemsMap.get(
          itemDto.originalOrderItemId
        );

        if (!originalOrderItem) {
          throw new Error("Order item not found");
        }

        // Validate return quantity
        const remainingQuantity =
          originalOrderItem.quantity - originalOrderItem.returnedQuantity;

        if (itemDto.quantityReturned > remainingQuantity) {
          throw new Error(
            `Invalid return quantity. Available: ${remainingQuantity}, Requested: ${itemDto.quantityReturned}`
          );
        }

        // Calculate refund amount for this item
        const unitRefundAmount = originalOrderItem.unitPrice;
        const itemRefundAmount = unitRefundAmount * itemDto.quantityReturned;
        totalRefundAmount += itemRefundAmount;

        // Prepare return item data for bulk creation
        const returnItemData = {
          storeId: originalOrder.storeId,
          returnId: returnRecord.id,
          originalOrderItemId: originalOrderItem.id,
          tenantId: returnRecord.tenantId,
          quantityReturned: itemDto.quantityReturned,
          unitRefundAmount: unitRefundAmount,
          totalRefundAmount: itemRefundAmount,
          returnToInventory: itemDto.returnToInventory,
        };

        returnItemsToCreate.push(returnItemData);

        // Prepare order item data for update
        orderItemsToUpdate.push({
          id: originalOrderItem.id,
          data: {
            isReturned: true,
            returnedQuantity:
              originalOrderItem.returnedQuantity + itemDto.quantityReturned,
          },
        });
      }

      // Bulk create return items for better performance
      const createdReturnItems = await this.returnItemsRepository.createBulk(
        returnItemsToCreate.map((item) => ({
          ...item,
          storeId: originalOrder.storeId,
        }))
      );

      // Bulk update order items for better performance
      await this.orderItemsRepository.bulkUpdate(orderItemsToUpdate);

      // Process inventory for returned items
      await this.processInventoryReturn({
        returnId: returnRecord.id,
        returnItems: createdReturnItems,
        storeId: originalOrder.storeId,
        userId,
        returnReason: createDto.returnReason,
      });

      // Update return record with total refund amount
      await this.returnsRepository.update(returnRecord.id, {
        refundAmount: totalRefundAmount,
      });

      // Determine if all items in the order have been returned
      let isFullReturn = true;
      for (const orderItem of orderItems) {
        const update = orderItemsToUpdate.find((u) => u.id === orderItem.id);
        const newReturnedQuantity = update
          ? update.data.returnedQuantity || 0
          : orderItem.returnedQuantity;

        if (newReturnedQuantity < orderItem.quantity) {
          isFullReturn = false;
          break;
        }
      }

      // Update original order status
      await this.ordersRepository.updateOrder(originalOrder.id, {
        status: isFullReturn
          ? OrderStatus.REFUNDED
          : OrderStatus.PARTIALLY_REFUNDED,
      });

      // Return the complete return record
      return this.findById(returnRecord.id);
    } catch (error) {
      console.error("Error creating return:", error);
      throw error;
    }
  }

  /**
   * Process inventory return for items marked to return to inventory
   * @param params Return processing parameters
   * @private
   */
  private async processInventoryReturn({
    returnId,
    returnItems,
    storeId,
    userId,
    returnReason,
  }: {
    returnId: string;
    returnItems: ReturnItemDto[];
    storeId?: string;
    userId?: string;
    returnReason?: string;
  }): Promise<void> {
    if (!storeId) {
      // If no store ID provided, skip inventory processing
      return;
    }

    const tenant = await this.storesService.getCurrentTenant();

    // Process each return item that should be returned to inventory
    for (const returnItem of returnItems) {
      if (returnItem.returnToInventory) {
        // Get the return record to access original order ID
        const returnRecord = await this.returnsRepository.findById(returnId);
        if (!returnRecord) {
          console.error(
            `Return record ${returnId} not found during inventory processing`
          );
          continue;
        }

        // Get the order items to access the variant ID
        const orderItems = await this.orderItemsRepository.findByOrderId(
          returnRecord.originalOrderId
        );

        const orderItem = orderItems.find(
          (item) => item.id === returnItem.originalOrderItemId
        );

        // Skip if no variant ID (can't add to inventory)
        if (!orderItem?.variantId) {
          continue;
        }

        try {
          // Use inventory service to return stock to inventory
          await this.inventoryService.returnStock({
            variantId: orderItem.variantId,
            storeId: storeId,
            quantity: returnItem.quantityReturned,
            referenceId: returnId,
            referenceType: InventoryReferenceType.ORDER_RETURN,
            currentUserId: userId || "",
            tenantId: tenant?.id || "",
            reason: `Return: ${returnReason || "Customer return"}`,
          });
        } catch (error) {
          // Log error but continue processing (don't fail the entire return)
          console.error(
            `Failed to process inventory return: ${(error as Error).message}`
          );
        }
      }
    }
  }

  /**
   * Process a return and issue refund
   * @param id Return ID to process
   * @param processDto Refund processing data
   * @param userId User processing the return
   * @returns Updated return record
   */
  async processReturn(
    id: string,
    processDto: ProcessReturnDto,
    userId: string
  ): Promise<ReturnDto> {
    // First, make sure the return exists
    const returnRecord = await this.returnsRepository.findById(id);
    if (!returnRecord) {
      throw new Error("Return not found");
    }

    // Process the refund through the refund service
    await this.refundService.processRefund(
      {
        returnId: id,
        refundMethod: processDto.refundMethod,
        paymentDetails: processDto.paymentDetails,
        notes: processDto.notes,
      },
      userId
    );

    // Return the updated return record
    return this.findById(id);
  }

  /**
   * Approve or reject a return requiring approval
   * @param id Return ID
   * @param approveDto Approval data
   * @param userId ID of user approving the return
   * @returns Updated return record
   */
  async approveReturn(
    id: string,
    approveDto: ApproveReturnDto,
    userId: string
  ): Promise<ReturnDto> {
    const returnRecord = await this.returnsRepository.findById(id);

    if (!returnRecord) {
      throw new Error("Return not found");
    }

    try {
      // Check if return requires approval
      if (!returnRecord.requiresApproval) {
        throw new Error("Return does not require approval");
      }

      // Update the return with approval data
      await this.returnsRepository.update(id, {
        approvedBy: approveDto.approved ? userId : undefined,
        approvalNotes: approveDto.approvalNotes,
      });

      return this.findById(id);
    } catch (error) {
      console.error("Error approving return:", error);
      throw error;
    }
  }

  /**
   * Validate and process return creation with full validation
   * @param createDto Return creation data
   * @param userId ID of user creating the return
   * @param storeId Store ID for inventory integration
   * @returns Created return record
   */
  async validateAndProcessReturnCreation(
    createDto: CreateReturnDto,
    userId: string
  ): Promise<ReturnDto> {
    const originalOrder = await this.ordersRepository.findById(
      createDto.originalOrderId
    );

    if (!originalOrder) {
      throw new Error("Original order not found");
    }

    // Step 1: Validate return eligibility
    const eligibility =
      await this.returnValidationService.validateReturnEligibility(
        originalOrder
      );

    if (!eligibility.eligible && !eligibility.requiresApproval) {
      throw new Error(eligibility.reason || "Return not eligible");
    }

    // Step 2: Validate return items (including inventory validation if storeId provided)
    const itemValidation =
      await this.returnValidationService.validateReturnItems(
        eligibility.order,
        createDto.items
      );

    if (!itemValidation.valid) {
      throw new Error(
        itemValidation.errors?.[0].message ?? "Invalid return items"
      );
    }

    // Step 3: Create the return with the validation results
    const returnData = await this.create(createDto, userId);

    return returnData;
  }
}
