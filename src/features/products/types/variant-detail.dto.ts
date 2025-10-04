import { inventory, productVariants } from "../../../db/schemas";

export type VariantDetailDTO = typeof productVariants.$inferSelect & {
  inventory: typeof inventory.$inferSelect | null;
  product: {
    id: string;
    name: string | null;
  };
};
