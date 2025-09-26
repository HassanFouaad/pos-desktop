import { drizzleDb, DrizzleDb } from "../../../db/drizzle";
import { stores } from "../../../db/schemas";

export type StoreDTO = typeof stores.$inferSelect;

export class StoresRepository {
  private db: DrizzleDb["database"];

  constructor() {
    this.db = drizzleDb.database;
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
