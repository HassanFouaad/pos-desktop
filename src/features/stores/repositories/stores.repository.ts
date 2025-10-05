import { drizzleDb } from "../../../db";
import { stores } from "../../../db/schemas";

export type StoreDTO = typeof stores.$inferSelect;

export class StoresRepository {
  private db: typeof drizzleDb;

  constructor() {
    this.db = drizzleDb;
  }

  /**
   * Retrieves the first store from the database.
   * Assumes at least one store exists for the POS to operate.
   */
  async getCurrentStore(): Promise<StoreDTO | null> {
    const [store] = await this.db.select().from(stores).limit(1).execute();
    return store || null;
  }
}

export const storesRepository = new StoresRepository();
