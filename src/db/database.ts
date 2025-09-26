import { electricSync, PGliteWithSync } from "@electric-sql/pglite-sync";
import { live } from "@electric-sql/pglite/live";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import dayjs from "dayjs";
import { config } from "../config";
import { getLocalStorage } from "../utils/storage";
const database = await PGliteWorker.create(
  new Worker(new URL("./my-pglite-worker.js", import.meta.url), {
    type: "module",
  }),
  {
    extensions: {
      electric: electricSync({ debug: true }),
      live,
    },
  }
);

const startSync = async () => {
  const sync = await (
    database as any as PGliteWithSync
  ).electric.syncShapesToTables({
    shapes: {
      stores: {
        shape: {
          url: config.ELECTRIC_URL + "/stores",
          params: { table: "stores" },
          headers: {
            "x-sync-token": getLocalStorage("accessToken") ?? "",
          },
        },
        table: "stores",
        primaryKey: ["id"],
      },
      categories: {
        shape: {
          url: config.ELECTRIC_URL + "/categories",
          table: "categories",
          headers: {
            "x-sync-token": getLocalStorage("accessToken") ?? "",
          },
        },
        shapeKey: "categories",
        table: "categories",
        primaryKey: ["id"],
      },
      products: {
        shape: {
          url: config.ELECTRIC_URL + "/products",
          table: "products",
          headers: {
            "x-sync-token": getLocalStorage("accessToken") ?? "",
          },
        },
        table: "products",
        primaryKey: ["id"],
        schema: "public",
        shapeKey: "products",
      },
      product_variants: {
        shape: {
          url: config.ELECTRIC_URL + "/product_variants",
          table: "product_variants",
          headers: {
            "x-sync-token": getLocalStorage("accessToken") ?? "",
          },
        },
        table: "product_variants",
        primaryKey: ["id"],
        shapeKey: "product_variants",
      },
      inventory: {
        shape: {
          url: config.ELECTRIC_URL + "/inventory",
          params: { table: "inventory" },
          headers: {
            "x-sync-token": getLocalStorage("accessToken") ?? "",
          },
        },
        table: "inventory",
        primaryKey: ["id"],
      },
      customers: {
        shape: {
          url: config.ELECTRIC_URL + "/customers",
          params: { table: "customers" },
          headers: {
            "x-sync-token": getLocalStorage("accessToken") ?? "",
          },
        },
        table: "customers",
        primaryKey: ["id"],
      },
    },
    key: dayjs().subtract(1, "week").endOf("week").format("YYYY-MM-DD"),
    onInitialSync: () => {
      console.log("Initial sync complete");
    },
  });

  return () => {
    sync.unsubscribe();
  };
};

startSync();

export { database, startSync };
