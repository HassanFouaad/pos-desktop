import { drizzleDb } from "../../../db";
import { pos, stores, tenants } from "../../../db/schemas";
import { PosDTO, StoreDto, TenantDto } from "../types";

export class StoresRepository {
  private db: typeof drizzleDb;

  constructor() {
    this.db = drizzleDb;
  }

  /**
   * Retrieves the first tenant from the database.
   * Assumes at least one tenant exists for the POS to operate.
   */
  async getCurrentTenant(): Promise<TenantDto | null> {
    const [tenant] = await this.db.select().from(tenants).limit(1).execute();
    return (tenant as any as TenantDto) || null;
  }

  /**
   * Retrieves the first store from the database.
   * Assumes at least one store exists for the POS to operate.
   */
  async getCurrentStore(): Promise<StoreDto | null> {
    const [store] = await this.db.select().from(stores).limit(1).execute();
    return (store as any as StoreDto) || null;
  }

  async getCurrentPos(): Promise<PosDTO | null> {
    const [posData] = await this.db.select().from(pos).limit(1).execute();
    return (posData as any as PosDTO) || null;
  }
}

export const storesRepository = new StoresRepository();
