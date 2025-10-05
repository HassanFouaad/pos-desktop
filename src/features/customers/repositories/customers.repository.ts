import { desc, ilike, or } from "drizzle-orm";
import { v4 } from "uuid";
import { drizzleDb } from "../../../db";
import { customers } from "../../../db/schemas";
import { usersRepository } from "../../users/repositories/users.repository";
import { CustomerDTO } from "../types/customer.dto";

export class CustomersRepository {
  private db: typeof drizzleDb;

  constructor() {
    this.db = drizzleDb;
  }

  async getCustomers(
    searchTerm: string | undefined,
    limit: number,
    offset: number
  ): Promise<CustomerDTO[]> {
    const query = this.db
      .select()
      .from(customers)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(customers.createdAt));

    if (searchTerm) {
      query.where(
        or(
          ilike(customers.name, `%${searchTerm}%`),
          ilike(customers.phone, `%${searchTerm}%`)
        )
      );
    }
    const [customersData] = await Promise.all([query.execute()]);

    console.log("customersData", customersData);
    return customersData;
  }

  async createCustomer(customerData: {
    name?: string;
    phone: string;
  }): Promise<void> {
    const loggedInUser = await usersRepository.getLoggedInUser();

    const localId = v4();
    // Create payload for the changes table
    const payload = {
      ...customerData,
      id: localId,
      tenantId: loggedInUser?.tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
      localId,
    };

    await this.db
      .insert(customers)
      .values({
        ...payload,
      })
      .execute();
  }
}

export const customersRepository = new CustomersRepository();
