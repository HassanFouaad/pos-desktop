import { PGliteWithSync } from "@electric-sql/pglite-sync";
import { config } from "../config";
import {
  categories,
  customers,
  inventory,
  products,
  productVariants,
  storePrices,
  stores,
} from "./schemas";

const getStoreColumns = () => {
  const cols: Record<string, string> = {};
  Object.keys(stores).forEach((key) => {
    if (key === "enableRLS") return;
    cols[key] = key;
  });
  return cols;
};
const getCategoryColumns = () => {
  const cols: Record<string, string> = {};
  Object.keys(categories).forEach((key) => {
    if (key === "enableRLS") return;
    cols[key] = key;
  });
  return cols;
};
const getProductColumns = () => {
  const cols: Record<string, string> = {};
  Object.keys(products).forEach((key) => {
    if (key === "enableRLS") return;
    cols[key] = key;
  });
  return cols;
};
const getProductVariantColumns = () => {
  const cols: Record<string, string> = {};
  Object.keys(productVariants).forEach((key) => {
    if (key === "enableRLS") return;
    cols[key] = key;
  });
  return cols;
};

const getInventoryColumns = () => {
  const cols: Record<string, string> = {};
  Object.keys(inventory).forEach((key) => {
    if (key === "enableRLS") return;
    cols[key] = key;
  });
  return cols;
};

const getCustomerColumns = () => {
  const cols: Record<string, string> = {};
  Object.keys(customers).forEach((key) => {
    if (key === "enableRLS") return;
    cols[key] = key;
  });
  return cols;
};

const getStorePriceColumns = () => {
  const cols: Record<string, string> = {};
  Object.keys(storePrices).forEach((key) => {
    if (key === "enableRLS") return;
    cols[key] = key;
  });
  return cols;
};

export const startElectricSync = async (
  database: PGliteWithSync,
  token: string,
  persistanceId: string = "default"
) => {
  try {
    const res = await database.electric.syncShapesToTables({
      shapes: {
        stores: {
          shape: {
            url: config.ELECTRIC_URL + "/stores",
            params: { table: "stores" },
            headers: {
              "x-sync-token": token ?? "",
            },
            //fetchClient: fetch,
          },
          table: "stores",
          primaryKey: ["id"],
          mapColumns: getStoreColumns(),
        },
        categories: {
          shape: {
            url: config.ELECTRIC_URL + "/categories",
            table: "categories",
            headers: {
              "x-sync-token": token ?? "",
            },
            //fetchClient: fetch,
          },
          table: "categories",
          primaryKey: ["id"],
          mapColumns: getCategoryColumns(),
        },
        products: {
          shape: {
            url: config.ELECTRIC_URL + "/products",
            table: "products",
            headers: {
              "x-sync-token": token ?? "",
            },
            //fetchClient: fetch,
          },
          table: "products",
          primaryKey: ["id"],
          schema: "public",

          mapColumns: getProductColumns(),
        },
        product_variants: {
          shape: {
            url: config.ELECTRIC_URL + "/product_variants",
            table: "product_variants",
            headers: {
              "x-sync-token": token ?? "",
            },
            //fetchClient: fetch,
          },
          table: "product_variants",
          primaryKey: ["id"],
          mapColumns: getProductVariantColumns(),
        },
        inventory: {
          shape: {
            url: config.ELECTRIC_URL + "/inventory",
            params: { table: "inventory" },
            headers: {
              "x-sync-token": token ?? "",
            },
            //fetchClient: fetch,
          },
          table: "inventory",
          primaryKey: ["id"],
          mapColumns: getInventoryColumns(),
        },
        customers: {
          shape: {
            url: config.ELECTRIC_URL + "/customers",
            params: { table: "customers" },
            headers: {
              "x-sync-token": token ?? "",
            },
            onError: (error: any) => {
              console.log("Ezrrorsssszxzxzxz", error);
            },
            //fetchClient: fetch,
          },
          onError: (error: any) => {
            console.log("Errorsssszxzxzxz", error);
          },
          table: "customers",
          primaryKey: ["id"],
          mapColumns: getCustomerColumns(),
        },
        store_prices: {
          shape: {
            url: config.ELECTRIC_URL + "/store_prices",
            params: { table: "store_prices" },
            headers: {
              "x-sync-token": token ?? "",
            },
            //fetchClient: fetch,
          },
          table: "store_prices",
          primaryKey: ["id"],
          mapColumns: getStorePriceColumns(),
        },
      },
      key: persistanceId,
      onError: (error: any) => {
        console.log("Ezrrorsssszxzxzxz", error);
      },
      onChange: (change: any) => {
        console.log("Change", change);
      },
      onInitialSync: () => {
        console.log("Initial sync complete");
      },
      onMustRefetch: () => {
        console.log("Must refetch");
      },
      initialInsertMethod: "csv",
    });
    console.log("res", res);
    console.log("Initial sync", res);
  } catch (error) {
    console.error("Failed to start sync:", error);
  }
};
