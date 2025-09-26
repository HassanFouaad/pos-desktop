import {
  ProductDTO,
  ProductVariantDTO,
} from "../repositories/products.repository";

/**
 * Formats a numeric value into a currency string using Intl.NumberFormat.
 * @param amount The numeric amount to format.
 * @param currency The ISO currency code (e.g., 'EGP', 'USD'). Defaults to 'EGP'.
 * @returns A formatted currency string (e.g., "EGP 1,250.50").
 */
export const formatCurrency = (
  amount: number | string | null | undefined,
  currency: string = "EGP"
): string => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    return "";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(numericAmount);
};

/**
 * Gets the formatted price for a single product variant.
 * @param variant The product variant object.
 * @param storeCurrency The currency of the store.
 * @returns The formatted price string.
 */
export const getVariantPrice = (
  variant: ProductVariantDTO,
  storeCurrency?: string | null
): string => {
  return formatCurrency(variant.baseSellingPrice, storeCurrency || "EGP");
};

/**
 * Gets the primary display price for a product.
 * If the product has only one variant, it returns that variant's price.
 * Otherwise, it returns the price of the first variant in the list.
 * @param product The product object.
 * @param storeCurrency The currency of the store.
 * @returns The formatted price string.
 */
export const getProductPrice = (
  product: ProductDTO,
  storeCurrency?: string | null
): string => {
  if (!product.variants || product.variants.length === 0) {
    return ""; // Or some default text like "N/A"
  }
  const primaryVariant = product.variants[0];
  return getVariantPrice(primaryVariant, storeCurrency);
};
