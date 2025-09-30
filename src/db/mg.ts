import type { PgDialect, PgSession } from "drizzle-orm/pg-core";
import type { PgliteDatabase } from "drizzle-orm/pglite";

// cache the migration status for the current session
let migrated = false;

export async function migrate(database: PgliteDatabase<any>) {
  if (migrated) return;

  const files = import.meta.glob<boolean, string, string>(
    "./migrations/*.sql",
    { query: "?raw", import: "default" }
  );

  // this path should also correspond to drizzle.config.ts
  const journal = await import("./migrations/meta/_journal.json");

  const migrations = [];

  for (const entry of journal.entries) {
    try {
      // ... and this path
      const migration = await files[`./migrations/${entry.tag}.sql`]!();
      const statements = migration.split("--> statement-breakpoint");

      migrations.push({
        sql: statements,
        bps: entry.breakpoints,
        folderMillis: entry.when,
        hash: await hash(migration),
      });
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to load migration ${entry.tag} from journal.`);
    }
  }

  // PgDialect and PgSession are marked as internal with stripInternal so we patch it
  const db = database as PgliteDatabase<any> & {
    dialect: PgDialect;
    session: PgSession;
  };

  await db.dialect.migrate(migrations, db.session, "");
  console.log("migrated successfully");
  migrated = true;
}

async function hash(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
