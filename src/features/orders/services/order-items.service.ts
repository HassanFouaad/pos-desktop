import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { inject, injectable } from "tsyringe";
import { DatabaseSchema } from "../../../db/schemas";
import { ProductsService } from "../../products/services/products.service";
import { OrderItemsRepository } from "../repositories/order-items.repository";
import {
  CreateOrderItemDto,
  LineItemCalculation,
  OrderItemDto,
  PreviewOrderItemDto,
} from "../types/order.types";

@injectable()
export class OrderItemsService {
  constructor(
    @inject(OrderItemsRepository)
    private readonly orderItemsRepository: OrderItemsRepository,
    @inject(ProductsService)
    private readonly productsService: ProductsService
  ) {}
  /**
   * Calculate line item totals based on quantity, price, and tax
   * Matches backend logic exactly
   */
  calculateLineItemTotals(
    unitPrice: number,
    quantity: number,
    taxRate: number = 0,
    taxIncluded: boolean = true
  ): LineItemCalculation {
    let actualUnitPrice = unitPrice;

    // Calculate price without tax if tax is included
    if (taxIncluded && taxRate > 0) {
      // Back-calculate the price without tax
      actualUnitPrice = unitPrice - (unitPrice * taxRate) / 100;
    }

    // Calculate line subtotal (quantity × unitPrice)
    const lineSubtotal = actualUnitPrice * quantity;

    // Apply discount (currently 0, can be extended)
    const lineDiscount = 0;

    // Calculate line total before tax
    const lineTotalBeforeTax = lineSubtotal - lineDiscount;

    // Calculate tax amount
    const lineTax = taxIncluded
      ? unitPrice * quantity - lineTotalBeforeTax
      : (lineTotalBeforeTax * taxRate) / 100;

    // Calculate final line total
    const lineTotal = lineTotalBeforeTax + lineTax;

    return {
      lineSubtotal,
      lineDiscount,
      lineTotalBeforeTax,
      lineTax,
      lineTotal,
    };
  }

  /**
   * Preview order items with calculations
   * Matches backend previewSalesOrderItems logic
   */
  async previewOrderItems(
    items: CreateOrderItemDto[],
    storeId: string
  ): Promise<PreviewOrderItemDto[]> {
    const previewItems: PreviewOrderItemDto[] = [];

    for (const item of items) {
      if (item.quantity <= 0) {
        throw new Error("Invalid quantity: must be greater than 0");
      }

      let unitPrice = 0;
      let originalUnitPrice = 0;
      let taxRate = 0;
      let taxIncluded = true;
      let productName = "";
      let variantName = "";
      let productSku = "";
      let variantAttributes: Record<string, string> = {};

      if (item.variantId) {
        // Get variant with all details in a single query (includes product, inventory, store price)
        const variant = await this.productsService.getVariantWithDetails(
          item.variantId,
          storeId
        );

        if (!variant) {
          throw new Error(`Variant not found: ${item.variantId}`);
        }

        if (!variant.product || variant.product.status !== "active") {
          throw new Error(`Product not active for variant: ${item.variantId}`);
        }

        // baseSellingPrice already has store-specific price applied if available
        unitPrice = variant.baseSellingPrice || 0;
        originalUnitPrice = variant.baseSellingPrice || 0;

        taxRate = variant.product.taxRate || 0;
        taxIncluded = variant.product.taxIncluded !== false; // Default to true
        productName = variant.product.name || "";
        variantName = variant.name || "";
        productSku = variant.sku || "";

        // Build variant attributes (e.g., {Size: 'Large', Color: 'Red'})
        // Note: variant attributes are not yet in the schema, can be added later
        variantAttributes = {};
      } else {
        // Non-stock item (custom item)
        if (typeof item.price !== "number" || item.price < 0) {
          throw new Error("Price required for non-stock items");
        }

        if (!item.variantName) {
          throw new Error("Variant name required for non-stock items");
        }

        unitPrice = item.price;
        originalUnitPrice = item.price;
        taxRate = 0;
        taxIncluded = true;
        variantName = item.variantName;
      }

      // Calculate line totals
      const calculations = this.calculateLineItemTotals(
        unitPrice,
        item.quantity,
        taxRate,
        taxIncluded
      );

      // Create preview item
      const previewItem: PreviewOrderItemDto = {
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        originalUnitPrice,
        lineSubtotal: calculations.lineSubtotal,
        lineDiscount: calculations.lineDiscount,
        lineTotalBeforeTax: calculations.lineTotalBeforeTax,
        productName,
        variantName,
        productSku,
        variantAttributes,
        lineTotal: calculations.lineTotal,
        lineTax: calculations.lineTax,
        stockType: item.stockType,
      };

      previewItems.push(previewItem);
    }

    return previewItems;
  }

  /**
   * Create order items in bulk
   */
  async createBulk(
    items: OrderItemDto[],
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    return this.orderItemsRepository.createBulk(items, manager);
  }

  /**
   * Find order items by order ID
   */
  async findByOrderId(orderId: string): Promise<OrderItemDto[]> {
    return this.orderItemsRepository.findByOrderId(orderId);
  }

  /**
   * Update multiple items in bulk
   */
  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<OrderItemDto> }>,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    return this.orderItemsRepository.bulkUpdate(updates, manager);
  }
}
