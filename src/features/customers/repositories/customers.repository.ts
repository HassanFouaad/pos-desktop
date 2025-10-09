import { desc, eq, like, or } from "drizzle-orm";
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
          like(customers.name, `%${searchTerm}%`),
          like(customers.phone, `%${searchTerm}%`)
        )
      );
    }
    const [customersData] = await Promise.all([query.execute()]);

    return customersData;
  }

  async createCustomer(customerData: {
    name?: string;
    phone: string;
  }): Promise<void> {
    const loggedInUser = await usersRepository.getLoggedInUser();

    const foundBefore = await this.db
      .select()
      .from(customers)
      .where(eq(customers.phone, customerData.phone))
      .limit(1)
      .execute();

    if (foundBefore?.[0]) {
      await this.db
        .update(customers)
        .set({
          ...customerData,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, foundBefore?.[0].id))
        .execute();
      return;
    }

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

  /**
   * Update customer visit data after a purchase
   * @param id Customer ID
   * @param amount Purchase amount
   */
  async updateVisitData(id: string, amount: number): Promise<void> {
    const customer = await this.db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1)
      .execute();

    if (!customer || customer.length === 0) {
      throw new Error(`Customer not found: ${id}`);
    }

    const customerData = customer[0];
    const totalVisits = (customerData.totalVisits || 0) + 1;
    const totalSpent = (customerData.totalSpent || 0) + amount;
    const averageOrderValue = totalSpent / totalVisits;

    await this.db
      .update(customers)
      .set({
        totalVisits,
        totalSpent,
        averageOrderValue,
        lastVisitAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
      .execute();
  }
}

export const customersRepository = new CustomersRepository();
