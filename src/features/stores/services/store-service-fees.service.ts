import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { inject, injectable } from "tsyringe";
import { DatabaseSchema } from "../../../db/schemas";
import { StoreServiceFeesRepository } from "../repositories/store-service-fees.repository";
import type { StoreServiceFeeDto } from "../types";

@injectable()
export class StoreServiceFeesService {
  constructor(
    @inject(StoreServiceFeesRepository)
    private readonly storeServiceFeesRepository: StoreServiceFeesRepository
  ) {}

  /**
   * Get all service fees for a store (no pagination)
   */
  async getAllServiceFeesByStoreId(
    storeId: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<StoreServiceFeeDto[]> {
    return this.storeServiceFeesRepository.getAllByStoreId(storeId, manager);
  }
}
