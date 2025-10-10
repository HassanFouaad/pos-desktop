import {
  DrizzleAppSchema,
  DrizzleTableWithPowerSyncOptions,
  wrapPowerSyncWithDrizzle,
} from "@powersync/drizzle-driver";

import { PowerSyncDatabase } from "@powersync/web";

import { config } from "../config";
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
  // Order-related tables that sync with backend
  orders: DatabaseSchema.orders,
  orderItems: DatabaseSchema.orderItems,
  returns: DatabaseSchema.returns,
  returnItems: DatabaseSchema.returnItems,
  orderHistory: DatabaseSchema.orderHistory,
});

export const powerSyncDb = new PowerSyncDatabase({
  database: {
    dbFilename: config.DATABASE_NAME,
  },

  flags: {
    useWebWorker: false,
  },

  schema: AppSchema,

  encryptionKey: config.SYNC_DB_ENCRYPTION_KEY,
});

// This is the DB you will use in queries
export const drizzleDb = wrapPowerSyncWithDrizzle(powerSyncDb, {
  schema: DatabaseSchema,
});
