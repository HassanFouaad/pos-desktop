import { ilike, or } from "drizzle-orm";
import { DrizzleDb, drizzleDb } from "../../../db/drizzle";
import { customers, pendingCustomers } from "../../../db/schemas";
import { usersRepository } from "../../users/repositories/users.repository";
import { CustomerDTO } from "../types/customer.dto";

export class CustomersRepository {
  private db: DrizzleDb["database"];

  constructor() {
    this.db = drizzleDb.database;
  }

  async getCustomers(
    searchTerm: string | undefined,
    limit: number,
    offset: number
  ): Promise<CustomerDTO[]> {
    const query = this.db.select().from(customers).limit(limit).offset(offset);

    if (searchTerm) {
      query.where(
        or(
          ilike(customers.name, `%${searchTerm}%`),
          ilike(customers.phone, `%${searchTerm}%`)
        )
      );
    }

    return query.execute();
  }

  async createPendingCustomer(customerData: {
    name?: string;
    phone: string;
  }): Promise<void> {
    const { name, phone } = customerData;
    const loggedInUser = await usersRepository.getLoggedInUser();

    await this.db.insert(pendingCustomers).values({
      phone,
      name: name,
      tenantId: loggedInUser?.tenantId,
      syncStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export const customersRepository = new CustomersRepository();
