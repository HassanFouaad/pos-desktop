import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { drizzleDb } from "../../../db";
import { DatabaseSchema } from "../../../db/schemas";
import { returnItems } from "../../../db/schemas/return-items.schema";
import { returns } from "../../../db/schemas/returns.schema";
import { CreateReturnDataDto, ReturnDto } from "../types/return.types";

export class ReturnsRepository {
  /**
   * Create a new return record
   */
  async create(
    data: CreateReturnDataDto,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<ReturnDto> {
    const now = new Date();
    const id = uuidv4();

    const returnData = {
      id,
      tenantId: data.tenantId,
      originalOrderId: data.originalOrderId,
      storeId: data.storeId,
      returnType: data.returnType,
      returnReason: data.returnReason,
      processedBy: data.processedBy,
      requiresApproval: data.requiresApproval ?? false,
      refundMethod: data.refundMethod,
      refundAmount: data.refundAmount ?? 0,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    await (manager ?? drizzleDb).insert(returns).values(returnData);

    return (await this.findById(id, manager))!;
  }

  /**
   * Find return by ID with items
   */
  async findById(
    id: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<ReturnDto | null> {
    const returnRecord = await (manager ?? drizzleDb)
      .select()
      .from(returns)
      .where(eq(returns.id, id))
      .limit(1);

    if (!returnRecord || returnRecord.length === 0) {
      return null;
    }

    // Get return items
    const items = await (manager ?? drizzleDb)
      .select()
      .from(returnItems)
      .where(eq(returnItems.returnId, id));

    const record = returnRecord[0];
    return {
      ...record,
      requiresApproval: Boolean(record.requiresApproval),
      refundAmount: record.refundAmount ?? 0,
      createdAt: new Date(record.createdAt!),
      updatedAt: new Date(record.updatedAt!),
      items: items.map((item) => ({
        ...item,
        returnToInventory: Boolean(item.returnToInventory),
        createdAt: new Date(item.createdAt!),
      })),
    } as ReturnDto;
  }

  /**
   * Update return record
   */
  async update(
    id: string,
    data: Partial<Omit<ReturnDto, "id" | "createdAt" | "updatedAt" | "items">>,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    await (manager ?? drizzleDb)
      .update(returns)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(returns.id, id));
  }

  /**
   * Find all returns for an order
   */
  async findByOriginalOrderId(
    orderId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<ReturnDto[]> {
    const returnRecords = await (manager ?? drizzleDb)
      .select()
      .from(returns)
      .where(eq(returns.originalOrderId, orderId))
      .orderBy(desc(returns.createdAt));

    return Promise.all(
      returnRecords.map(
        (record) => this.findById(record.id, manager) as Promise<ReturnDto>
      )
    );
  }

  /**
   * Find returns by store
   */
  async findByStoreId(
    storeId: string,
    limit: number = 50,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<ReturnDto[]> {
    const returnRecords = await (manager ?? drizzleDb)
      .select()
      .from(returns)
      .where(eq(returns.storeId, storeId))
      .orderBy(desc(returns.createdAt))
      .limit(limit);

    return Promise.all(
      returnRecords.map(
        (record) => this.findById(record.id, manager) as Promise<ReturnDto>
      )
    );
  }
}

export const returnsRepository = new ReturnsRepository();
