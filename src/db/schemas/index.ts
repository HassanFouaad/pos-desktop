// Import all schema definitions
import { categories } from "./categories.schema";
import { customers } from "./customers.schema";
import { inventoryAdjustments } from "./inventory-adjustments.schema";
import { inventory } from "./inventory.schema";
import { orderHistory } from "./order-history.schema";
import { orderItems } from "./order-items.schema";
import { orders } from "./orders.schema";
import { posDevices } from "./pos-devices.schema";
import { pos } from "./pos.schema";
import { productVariants } from "./product-variants.schema";
import { products } from "./products.schema";
import { returnItems } from "./return-items.schema";
import { returns } from "./returns.schema";
import { storePaymentMethods } from "./store-payment-methods.schema";
import { storePrices } from "./store-prices.schema";
import { storeServiceFees } from "./store-service-fees.schema";
import { stores } from "./stores.schema";
import { tenants } from "./tenants.schema";
import { users } from "./users.schema";

// Export all schemas for individual use throughout the application
export { categories } from "./categories.schema";
export { customers } from "./customers.schema";
export { inventoryAdjustments } from "./inventory-adjustments.schema";
export { inventory } from "./inventory.schema";
export { orderHistory } from "./order-history.schema";
export { orderItems } from "./order-items.schema";
export { orders } from "./orders.schema";
export { posDevices, type ConnectionStatus } from "./pos-devices.schema";
export { pos } from "./pos.schema";
export { productVariants } from "./product-variants.schema";
export { products } from "./products.schema";
export { returnItems } from "./return-items.schema";
export { returns } from "./returns.schema";
export { storePaymentMethods } from "./store-payment-methods.schema";
export { storePrices } from "./store-prices.schema";
export { storeServiceFees } from "./store-service-fees.schema";
export { stores } from "./stores.schema";
export { tenants } from "./tenants.schema";
export { users } from "./users.schema";

// Export complete database schema object
export const DatabaseSchema = {
  users,
  stores,
  tenants,
  categories,
  products,
  productVariants,
  inventory,
  inventoryAdjustments,
  customers,
  storePrices,
  storePaymentMethods,
  storeServiceFees,
  posDevices,
  orders,
  orderItems,
  returns,
  returnItems,
  orderHistory,
  pos,
};
