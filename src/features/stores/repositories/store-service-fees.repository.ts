import { eq } from "drizzle-orm";

import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { injectable } from "tsyringe";
import { drizzleDb } from "../../../db";
import { DatabaseSchema, storeServiceFees } from "../../../db/schemas";
import type { ServiceFeeType, StoreServiceFeeDto } from "../types";

@injectable()
export class StoreServiceFeesRepository {
  /**
   * Get all service fees for a store
   */
  async getAllByStoreId(
    storeId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<StoreServiceFeeDto[]> {
    const db = manager || drizzleDb;

    const fees = await db
      .select()
      .from(storeServiceFees)
      .where(eq(storeServiceFees.storeId, storeId))
      .execute();

    return fees.map((fee) => ({
      id: fee.id!,
      storeId: fee.storeId!,
      tenantId: fee.tenantId!,
      type: fee.type as ServiceFeeType,
      value: fee.value!,
      createdAt: fee.createdAt!,
      updatedAt: fee.updatedAt!,
    }));
  }
}
