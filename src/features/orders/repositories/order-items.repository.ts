import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { drizzleDb } from "../../../db";
import { OrderItemStockType } from "../../../db/enums";
import { orderItems } from "../../../db/schemas/order-items.schema";
import { OrderItemDto } from "../types/order.types";

export interface CreateOrderItemData {
  orderId: string;
  tenantId?: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice?: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineTotalBeforeTax: number;
  productName: string;
  variantName: string;
  productSku: string;
  variantAttributes?: Record<string, string>;
  stockType: OrderItemStockType;
  lineTotal: number;
}

export class OrderItemsRepository {
  /**
   * Create a new order item
   */
  async createItem(data: CreateOrderItemData): Promise<OrderItemDto> {
    const now = new Date();
    const itemId = uuidv4();

    const itemData = {
      id: itemId,
      orderId: data.orderId,
      tenantId: data.tenantId,
      variantId: data.variantId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      originalUnitPrice: data.originalUnitPrice || data.unitPrice,
      lineSubtotal: data.lineSubtotal,
      lineDiscount: data.lineDiscount || 0,
      lineTotalBeforeTax: data.lineTotalBeforeTax,
      productName: data.productName,
      variantName: data.variantName,
      productSku: data.productSku,
      variantAttributes: data.variantAttributes,
      stockType: data.stockType,
      isReturned: false,
      returnedQuantity: 0,
      lineTotal: data.lineTotal,
      createdAt: now,
      updatedAt: now,
    };

    await drizzleDb.insert(orderItems).values(itemData);

    return this.findById(itemId) as Promise<OrderItemDto>;
  }

  /**
   * Create multiple order items in bulk
   */
  async createBulk(items: CreateOrderItemData[]): Promise<OrderItemDto[]> {
    const now = new Date();

    const itemsData = items.map((item) => ({
      id: uuidv4(),
      orderId: item.orderId,
      tenantId: item.tenantId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      originalUnitPrice: item.originalUnitPrice || item.unitPrice,
      lineSubtotal: item.lineSubtotal,
      lineDiscount: item.lineDiscount || 0,
      lineTotalBeforeTax: item.lineTotalBeforeTax,
      productName: item.productName,
      variantName: item.variantName,
      productSku: item.productSku,
      variantAttributes: item.variantAttributes,
      stockType: item.stockType,
      isReturned: false,
      returnedQuantity: 0,
      lineTotal: item.lineTotal,
      createdAt: now,
      updatedAt: now,
    }));

    await drizzleDb.insert(orderItems).values(itemsData);

    return Promise.all(
      itemsData.map((item) => this.findById(item.id) as Promise<OrderItemDto>)
    );
  }

  /**
   * Find order item by ID
   */
  async findById(id: string): Promise<OrderItemDto | null> {
    const items = await drizzleDb
      .select()
      .from(orderItems)
      .where(eq(orderItems.id, id))
      .limit(1);

    if (!items || items.length === 0) {
      return null;
    }

    const item = items[0];
    return {
      ...item,
      variantAttributes: item.variantAttributes as
        | Record<string, string>
        | undefined,
      isReturned: Boolean(item.isReturned),
      createdAt: new Date(item.createdAt!),
      updatedAt: new Date(item.updatedAt!),
    } as OrderItemDto;
  }

  /**
   * Find all items for an order
   */
  async findByOrderId(orderId: string): Promise<OrderItemDto[]> {
    const items = await drizzleDb
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    return items.map((item) => ({
      ...item,
      variantAttributes: item.variantAttributes as
        | Record<string, string>
        | undefined,
      isReturned: Boolean(item.isReturned),
      createdAt: new Date(item.createdAt!),
      updatedAt: new Date(item.updatedAt!),
    })) as OrderItemDto[];
  }

  /**
   * Update order item
   */
  async updateItem(id: string, data: Partial<OrderItemDto>): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await drizzleDb
      .update(orderItems)
      .set(updateData)
      .where(eq(orderItems.id, id));
  }

  /**
   * Delete order item
   */
  async deleteItem(id: string): Promise<void> {
    await drizzleDb.delete(orderItems).where(eq(orderItems.id, id));
  }

  /**
   * Delete all items for an order
   */
  async deleteByOrderId(orderId: string): Promise<void> {
    await drizzleDb.delete(orderItems).where(eq(orderItems.orderId, orderId));
  }

  /**
   * Update multiple items in bulk
   */
  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<OrderItemDto> }>
  ): Promise<void> {
    for (const update of updates) {
      await this.updateItem(update.id, update.data);
    }
  }
}

export const orderItemsRepository = new OrderItemsRepository();
