import { PGlite } from "@electric-sql/pglite";
import { electricSync, PGliteWithSync } from "@electric-sql/pglite-sync";
import { live } from "@electric-sql/pglite/live";
import { fetch } from "@tauri-apps/plugin-http";
import { config } from "../config";
import { getLocalStorage } from "../utils/storage";
const database = new PGlite({
  dataDir: config.DATABASE_NAME,
  extensions: {
    electric: electricSync(),
    live,
  },
});

const startSync = async () => {
  const sync = await (
    database as any as PGliteWithSync
  ).electric.syncShapesToTables({
    shapes: {
      stores: {
        shape: {
          url: config.ELECTRIC_URL,
          params: { table: "stores" },
          fetchClient: fetch,
        },
        table: "stores",
        primaryKey: ["id"],
      },
      categories: {
        shape: {
          url: config.ELECTRIC_URL,
          params: { table: "categories" },
          headers: {
            "x-sync-token": getLocalStorage("accessToken") ?? "",
          },
        },
        table: "categories",
        primaryKey: ["id"],
      },
      products: {
        shape: {
          url: config.ELECTRIC_URL + "/products",
          params: { table: "products" },
          headers: {
            "x-sync-token": getLocalStorage("accessToken") ?? "",
          },
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

  return () => {
    sync.unsubscribe();
  };
};

export { database, startSync };
