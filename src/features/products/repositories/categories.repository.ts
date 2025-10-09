import { eq } from "drizzle-orm";
import { inject, singleton } from "tsyringe";
import { v4 } from "uuid";
import { drizzleDb } from "../../../db";
import { categories } from "../../../db/schemas";
import { UsersRepository } from "../../users/repositories/users.repository";

@singleton()
export class CategoriesRepository {
  constructor(
    @inject(UsersRepository)
    private readonly usersRepository: UsersRepository
  ) {}

  async createCategory(categoryData: { name: string }): Promise<void> {
    const loggedInUser = await this.usersRepository.getLoggedInUser();

    const id = v4();
    const payload = {
      id,
      name: categoryData.name,
      tenantId: loggedInUser?.tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await drizzleDb.insert(categories).values(payload).execute();
  }

  async updateCategory(categoryData: {
    id: string;
    name: string;
  }): Promise<void> {
    await drizzleDb
      .update(categories)
      .set({
        name: categoryData.name,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, categoryData.id))
      .execute();
  }
}
