import { drizzle } from "drizzle-orm/pglite";
import * as customerSchema from "../features/customers/models/schema";
import * as inventorySchema from "../features/inventory/models/schema";
import * as productSchema from "../features/products/models/schema";
import * as storeSchema from "../features/stores/models/schema";
import { getDb } from "./database";

const schema = {
  ...productSchema,
  ...inventorySchema,
  ...customerSchema,
  ...storeSchema,
};

// Singleton instance of drizzle
let drizzleDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

export const getDrizzleDb = async () => {
  if (drizzleDb) {
    return drizzleDb;
  }

  const db = await getDb();
  if (!db) {
    throw new Error("PGLite database not initialized");
  }

  drizzleDb = drizzle(db, { schema });
  return drizzleDb;
};
