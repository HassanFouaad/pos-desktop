import { inventory, productVariants, products } from "../../../db/schemas";

export type VariantDetailDTO = typeof productVariants.$inferSelect & {
  inventory: typeof inventory.$inferSelect | null;
  product: ProductDTO;
};

export type ProductVariantDTO = typeof productVariants.$inferSelect;

export type ProductDTO = typeof products.$inferSelect;
