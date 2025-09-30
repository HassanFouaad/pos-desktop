import { electricSync, PGliteWithSync } from "@electric-sql/pglite-sync";
import { btree_gin } from "@electric-sql/pglite/contrib/btree_gin";
import { tcn } from "@electric-sql/pglite/contrib/tcn";
import { live } from "@electric-sql/pglite/live";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import dayjs from "dayjs";
import { config } from "../config";

const database = await PGliteWorker.create(
  new Worker(new URL("./my-pglite-worker.js", import.meta.url), {
    type: "module",
  }),
  {
    extensions: {
      electric: electricSync({ debug: true }),
      live,
      btree_gin,
      tcn,
    },
  }
);

await database.waitReady;

const startSync = async (token: string, persistanceId: string = "default") => {
  try {
    const res = await (
      database as any as PGliteWithSync
    ).electric.syncShapesToTables({
      shapes: {
        stores: {
          shape: {
            url: config.ELECTRIC_URL + "/stores",
            params: { table: "stores" },
            headers: {
              "x-sync-token": token ?? "",
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
              "x-sync-token": token ?? "",
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
              "x-sync-token": token ?? "",
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
              "x-sync-token": token ?? "",
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
              "x-sync-token": token ?? "",
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
              "x-sync-token": token ?? "",
            },
          },
          table: "customers",
          primaryKey: ["id"],
        },
        store_prices: {
          shape: {
            url: config.ELECTRIC_URL + "/store_prices",
            params: { table: "store_prices" },
            headers: {
              "x-sync-token": token ?? "",
            },
          },
          table: "store_prices",
          primaryKey: ["id"],
        },
      },
      key:
        persistanceId +
        dayjs().subtract(1, "week").endOf("week").format("YYYY-MM-DD"),
      onInitialSync: () => {
        console.log("Initial sync complete");
      },
      initialInsertMethod: "csv",
    });
    console.log("Initial sync", res);
  } catch (error) {
    console.error("Failed to start sync:", error);
  }
};

export { database, startSync };
