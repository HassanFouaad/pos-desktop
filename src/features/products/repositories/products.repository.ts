import { eq } from "drizzle-orm";
import { getDrizzleDb } from "../../../lib/drizzle";
import { products } from "../models/schema";

export class ProductsRepository {
  private db: Awaited<ReturnType<typeof getDrizzleDb>> | null = null;

  constructor() {
    getDrizzleDb().then((db) => {
      this.db = db;
    });
  }

  async getAllProducts() {
    if (!this.db) {
      this.db = await getDrizzleDb();
    }
    return this.db.select().from(products).execute();
  }

  async getProductById(id: number) {
    if (!this.db) {
      this.db = await getDrizzleDb();
    }
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
