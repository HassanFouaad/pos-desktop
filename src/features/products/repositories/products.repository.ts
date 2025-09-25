import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { drizzleDb } from "../../../db/drizzle";
import { DatabaseSchema, products } from "../../../db/schemas";

export class ProductsRepository {
  private db!: ReturnType<typeof drizzle<typeof DatabaseSchema>>;

  constructor() {
    this.db = drizzleDb.database;
  }

  async getAllProducts() {
    return this.db?.select().from(products).execute();
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
