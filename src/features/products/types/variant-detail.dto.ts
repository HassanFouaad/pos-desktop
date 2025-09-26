import { inventory, productVariants } from "../../../db/schemas";

export type VariantDetailDTO = typeof productVariants.$inferSelect & {
  inventory: typeof inventory.$inferSelect | null;
  product: {
    id: number;
    name: string | null;
  };
};
