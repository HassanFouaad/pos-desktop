import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { and, eq } from "drizzle-orm";
import { singleton } from "tsyringe";
import { drizzleDb } from "../../../db";
import { DatabaseSchema, storePaymentMethods } from "../../../db/schemas";
import { StorePaymentMethodDto } from "../types";

@singleton()
export class StorePaymentMethodsRepository {
  /**
   * Find all payment methods for a store
   */
  async findByStoreId(
    storeId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<StorePaymentMethodDto[]> {
    const methods = await (manager ?? drizzleDb)
      .select()
      .from(storePaymentMethods)
      .where(eq(storePaymentMethods.storeId, storeId));

    return methods.map((method) => ({
      ...method,
      isActive: Boolean(method.isActive),
      createdAt: new Date(method.createdAt!),
      updatedAt: new Date(method.updatedAt!),
    })) as StorePaymentMethodDto[];
  }

  /**
   * Find only active payment methods for a store
   */
  async findActiveByStoreId(
    storeId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<StorePaymentMethodDto[]> {
    const methods = await (manager ?? drizzleDb)
      .select()
      .from(storePaymentMethods)
      .where(
        and(
          eq(storePaymentMethods.storeId, storeId),
          eq(storePaymentMethods.isActive, true)
        )
      );

    return methods.map((method) => ({
      ...method,
      isActive: Boolean(method.isActive),
      createdAt: new Date(method.createdAt!),
      updatedAt: new Date(method.updatedAt!),
    })) as StorePaymentMethodDto[];
  }

  /**
   * Find payment method by ID
   */
  async findById(
    id: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<StorePaymentMethodDto | null> {
    const methods = await (manager ?? drizzleDb)
      .select()
      .from(storePaymentMethods)
      .where(eq(storePaymentMethods.id, id))
      .limit(1);

    if (!methods || methods.length === 0) {
      return null;
    }

    const method = methods[0];
    return {
      ...method,
      isActive: Boolean(method.isActive),
      createdAt: new Date(method.createdAt!),
      updatedAt: new Date(method.updatedAt!),
    } as StorePaymentMethodDto;
  }
}
