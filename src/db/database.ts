import {
  DrizzleAppSchema,
  DrizzleTableWithPowerSyncOptions,
  wrapPowerSyncWithDrizzle,
} from "@powersync/drizzle-driver";

import { PowerSyncDatabase } from "@powersync/web";

import { DatabaseSchema } from "./schemas";

export const AppSchema = new DrizzleAppSchema({
  ...DatabaseSchema,
  users: {
    tableDefinition: DatabaseSchema.users,
    options: {
      localOnly: true,
    },
  } as DrizzleTableWithPowerSyncOptions,
  posDevices: {
    tableDefinition: DatabaseSchema.posDevices,
    options: {
      localOnly: true,
    },
  } as DrizzleTableWithPowerSyncOptions,
});

export const powerSyncDb = new PowerSyncDatabase({
  database: {
    dbFilename: "powersync.db",
  },
  schema: AppSchema,
  flags: {
    useWebWorker: false,
  },
});

// This is the DB you will use in queries
export const drizzleDb = wrapPowerSyncWithDrizzle(powerSyncDb, {
  schema: DatabaseSchema,
});
