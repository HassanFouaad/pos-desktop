import { drizzleDb } from "../../../db";
import { pos, stores, tenants } from "../../../db/schemas";

export type StoreDTO = typeof stores.$inferSelect;
export type TenantDTO = typeof tenants.$inferSelect;
export type PosDTO = typeof pos.$inferSelect;

export class StoresRepository {
  private db: typeof drizzleDb;

  constructor() {
    this.db = drizzleDb;
  }

  /**
   * Retrieves the first tenant from the database.
   * Assumes at least one tenant exists for the POS to operate.
   */
  async getCurrentTenant(): Promise<TenantDTO | null> {
    const [tenant] = await this.db.select().from(tenants).limit(1).execute();
    return tenant || null;
  }

  /**
   * Retrieves the first store from the database.
   * Assumes at least one store exists for the POS to operate.
   */
  async getCurrentStore(): Promise<StoreDTO | null> {
    const [store] = await this.db.select().from(stores).limit(1).execute();
    return store || null;
  }

  async getCurrentPos(): Promise<PosDTO | null> {
    const [posData] = await this.db.select().from(pos).limit(1).execute();
    return posData || null;
  }
}

export const storesRepository = new StoresRepository();
