import { PGlite } from "@electric-sql/pglite";
import {
  electricSync,
  SyncShapesToTablesOptions,
  SyncShapesToTablesResult,
  SyncShapeToTableOptions,
  SyncShapeToTableResult,
} from "@electric-sql/pglite-sync";
import { live } from "@electric-sql/pglite/live";
import { config } from "../config";
// Singleton instance of the database
let db:
  | (PGlite & {
      electric: {
        initMetadataTables: () => Promise<void>;
        syncShapesToTables: ({
          key,
          shapes,
          useCopy,
          initialInsertMethod,
          onInitialSync,
        }: SyncShapesToTablesOptions) => Promise<SyncShapesToTablesResult>;
        syncShapeToTable: (
          options: SyncShapeToTableOptions
        ) => Promise<SyncShapeToTableResult>;
        deleteSubscription: (key: string) => Promise<void>;
      };
    })
  | null = null;

export const getDb = async (): Promise<
  | (PGlite & {
      electric: {
        initMetadataTables: () => Promise<void>;
        syncShapesToTables: ({
          key,
          shapes,
          useCopy,
          initialInsertMethod,
          onInitialSync,
        }: SyncShapesToTablesOptions) => Promise<SyncShapesToTablesResult>;
        syncShapeToTable: (
          options: SyncShapeToTableOptions
        ) => Promise<SyncShapeToTableResult>;
        deleteSubscription: (key: string) => Promise<void>;
      };
    })
  | null
> => {
  if (db) {
    return db;
  }

  // Initialize PGLite with the ElectricSQL sync extension
  db = await PGlite.create({
    extensions: {
      electric: electricSync(),
      live,
    },
  });

  return db;
};

export const startSync = async (accessToken: string) => {
  if (!db) {
    throw new Error("Database not initialized. Call getDb() first.");
  }

  // TODO: Make the URL and key configurable
  const sync = await db.electric.syncShapesToTables({
    shapes: {
      stores: {
        shape: {
          url: config.ELECTRIC_URL,
          params: { table: "stores" },
        },
        table: "stores",
        primaryKey: ["id"],
      },
      categories: {
        shape: {
          url: config.ELECTRIC_URL,
          params: { table: "categories" },
        },
        table: "categories",
        primaryKey: ["id"],
      },
      products: {
        shape: {
          url: config.ELECTRIC_URL,
          params: { table: "products" },
        },
        table: "products",
        primaryKey: ["id"],
      },
      product_variants: {
        shape: {
          url: config.ELECTRIC_URL,
          params: { table: "product_variants" },
        },
        table: "product_variants",
        primaryKey: ["id"],
      },
      inventory: {
        shape: {
          url: config.ELECTRIC_URL,
          params: { table: "inventory" },
        },
        table: "inventory",
        primaryKey: ["id"],
      },
      customers: {
        shape: {
          url: config.ELECTRIC_URL,
          params: { table: "customers" },
        },
        table: "customers",
        primaryKey: ["id"],
      },
    },
    key: "main-sync",
    onInitialSync: () => {
      console.log("Initial sync complete");
    },
  });

  console.log("Syncing shapes...");

  return () => {
    sync.unsubscribe();
  };
};
