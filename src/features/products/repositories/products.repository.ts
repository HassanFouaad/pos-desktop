import { and, eq, ilike, or } from "drizzle-orm";
import { DrizzleDb, drizzleDb } from "../../../db/drizzle";
import {
  categories,
  inventory,
  products,
  productVariants,
  storePrices,
} from "../../../db/schemas";
import type { CategoryDTO } from "../types/category.dto";
import type { VariantDetailDTO } from "../types/variant-detail.dto";

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

  /**
   * Fetches a list of variants for a given category, including product and inventory info.
   * @param categoryId The ID of the category.
   * @param storeId The ID of the current store to fetch store-specific prices.
   * @param searchTerm An optional search term to filter by variant, SKU, or product name.
   */
  async getVariantsByCategory(
    categoryId: string,
    storeId: string,
    searchTerm: string | undefined,
    limit: number,
    offset: number
  ): Promise<VariantDetailDTO[]> {
    const results = await this.db
      .select({
        // Explicitly select all columns to shape the DTO correctly
        id: productVariants.id,
        productId: productVariants.productId,
        tenantId: productVariants.tenantId,
        name: productVariants.name,
        unitOfMeasure: productVariants.unitOfMeasure,
        sku: productVariants.sku,
        baseSellingPrice: productVariants.baseSellingPrice,
        basePurchasePrice: productVariants.basePurchasePrice,
        createdAt: productVariants.createdAt,
        updatedAt: productVariants.updatedAt,
        inventory: inventory,
        product: {
          id: products.id,
          name: products.name,
        },
        storePrice: storePrices.price,
      })
      .from(productVariants)
      .leftJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(inventory, eq(productVariants.id, inventory.variantId))
      .leftJoin(
        storePrices,
        and(
          eq(storePrices.variantId, productVariants.id),
          eq(storePrices.storeId, storeId)
        )
      )
      .where(
        and(
          eq(products.categoryId, categoryId),
          searchTerm
            ? or(
                ilike(productVariants.name, `%${searchTerm}%`),
                ilike(productVariants.sku, `%${searchTerm}%`),
                ilike(products.name, `%${searchTerm}%`)
              )
            : undefined
        )
      )
      .limit(limit)
      .offset(offset)
      .execute();

    // If a store-specific price exists, override the baseSellingPrice
    return results.map((row) => {
      const { storePrice, ...variantData } = row;
      if (storePrice !== null && storePrice !== undefined) {
        variantData.baseSellingPrice = storePrice;
      }
      return variantData as VariantDetailDTO;
    });
  }
}

export const productsRepository = new ProductsRepository();
