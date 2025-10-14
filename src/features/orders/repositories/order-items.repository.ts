import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { eq, inArray } from "drizzle-orm";
import { singleton } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { drizzleDb } from "../../../db";
import { DatabaseSchema } from "../../../db/schemas";
import { orderItems } from "../../../db/schemas/order-items.schema";
import { OrderItemDto } from "../types/order.types";

@singleton()
export class OrderItemsRepository {
  /**
   * Create a new order item
   */
  async createItem(
    data: Omit<OrderItemDto, "id" | "createdAt" | "updatedAt">,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<string> {
    const now = new Date();
    const itemId = uuidv4();

    const itemData = {
      id: itemId,
      orderId: data.orderId,
      storeId: data.storeId,
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
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await (manager ?? drizzleDb).insert(orderItems).values(itemData);
    return itemId;
  }

  /**
   * Create multiple order items in bulk
   */
  async createBulk(
    items: Omit<OrderItemDto, "id" | "createdAt" | "updatedAt">[],
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }

    const now = new Date();

    const itemsData = items.map((item) => {
      const id = uuidv4();
      return {
        id,
        orderId: item.orderId,
        storeId: item.storeId,
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
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
    });

    await (manager ?? drizzleDb).insert(orderItems).values(itemsData);
    return;
  }

  /**
   * Find multiple items by their IDs
   */
  async findManyByIds(
    ids: string[],
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<OrderItemDto[]> {
    if (ids.length === 0) {
      return [];
    }

    const items = await (manager ?? drizzleDb)
      .select()
      .from(orderItems)
      .where(inArray(orderItems.id, ids));

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
   * Find order item by ID
   */
  async findById(
    id: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<OrderItemDto | null> {
    const items = await (manager ?? drizzleDb)
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
  async findByOrderId(
    orderId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<OrderItemDto[]> {
    const items = await (manager ?? drizzleDb)
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
  async updateItem(
    id: string,
    data: Partial<OrderItemDto>,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    const updateData = {
      ...data,
      createdAt: data.createdAt?.toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await (manager ?? drizzleDb)
      .update(orderItems)
      .set(updateData)
      .where(eq(orderItems.id, id));
  }

  /**
   * Delete order item
   */
  async deleteItem(
    id: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    await (manager ?? drizzleDb)
      .delete(orderItems)
      .where(eq(orderItems.id, id));
  }

  /**
   * Delete all items for an order
   */
  async deleteByOrderId(
    orderId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    await (manager ?? drizzleDb)
      .delete(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  /**
   * Update multiple items in bulk
   */
  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<OrderItemDto> }>,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    for (const update of updates) {
      await this.updateItem(update.id, update.data, manager);
    }
  }
}
