import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { drizzleDb } from "../../../db";
import { categories } from "../../../db/schemas";
import { usersRepository } from "../../users/repositories/users.repository";

export class CategoriesRepository {
  private db: typeof drizzleDb;

  constructor() {
    this.db = drizzleDb;
  }

  async createCategory(categoryData: { name: string }): Promise<void> {
    const loggedInUser = await usersRepository.getLoggedInUser();

    const id = v4();
    const payload = {
      id,
      name: categoryData.name,
      tenantId: loggedInUser?.tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(categories).values(payload).execute();
  }

  async updateCategory(categoryData: {
    id: string;
    name: string;
  }): Promise<void> {
    await this.db
      .update(categories)
      .set({
        name: categoryData.name,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, categoryData.id))
      .execute();
  }
}

export const categoriesRepository = new CategoriesRepository();
