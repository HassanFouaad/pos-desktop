import { eq, ilike, or } from "drizzle-orm";
import { DrizzleDb, drizzleDb } from "../../../db/drizzle";
import { categories, products, productVariants } from "../../../db/schemas";

export type ProductVariantDTO = typeof productVariants.$inferSelect;
export type ProductDTO = typeof products.$inferSelect & {
  variants: ProductVariantDTO[];
};
export type CategoryDTO = typeof categories.$inferSelect;

export class ProductsRepository {
  private db: DrizzleDb["database"];

  constructor() {
    this.db = drizzleDb.database;
  }

  async getCategories(searchTerm?: string): Promise<CategoryDTO[]> {
    const query = this.db.select().from(categories);

    if (searchTerm) {
      query.where(ilike(categories.name, `%${searchTerm}%`));
    }

    return query.execute();
  }

  async getProducts(
    categoryId?: number,
    searchTerm?: string
  ): Promise<ProductDTO[]> {
    let query = this.db
      .select()
      .from(products)
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .where(categoryId ? eq(products.categoryId, categoryId) : undefined);

    if (searchTerm) {
      query.where(
        or(
          ilike(products.name, `%${searchTerm}%`),
          ilike(productVariants.name, `%${searchTerm}%`),
          ilike(productVariants.sku, `%${searchTerm}%`)
        )
      );
    }

    const rows = await query.execute();

    const productMap = new Map<number, ProductDTO>();

    for (const row of rows) {
      const { products: productData, product_variants: variantData } = row;

      if (!productMap.has(productData.id)) {
        productMap.set(productData.id, {
          ...productData,
          variants: [],
        });
      }

      if (variantData) {
        productMap.get(productData.id)!.variants.push(variantData);
      }
    }

    return Array.from(productMap.values());
  }

  async getProductById(id: number) {
    const [product] = await this.db
      .select()
      .from(products)
      .where((p) => eq(p.id, id))
      .limit(1)
      .execute();
    return product;
  }
}

export const productsRepository = new ProductsRepository();
