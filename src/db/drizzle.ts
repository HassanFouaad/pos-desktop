import { drizzle } from "drizzle-orm/pglite";

import { database } from "./database";
import { migrate } from "./mg";
import { DatabaseSchema } from "./schemas";

export class DrizzleDb {
  private db: ReturnType<typeof drizzle<typeof DatabaseSchema>> = drizzle(
    database as any,
    { schema: DatabaseSchema }
  );

  get database() {
    return this.db;
  }
}

const drizzleDb = new DrizzleDb();
await migrate(drizzleDb.database);
export { drizzleDb };
