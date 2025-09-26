import { ilike, or } from "drizzle-orm";
import { DrizzleDb, drizzleDb } from "../../../db/drizzle";
import { customers } from "../../../db/schemas";
import { SyncOperation, syncService } from "../../../db/sync/sync.service";
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

  async createCustomer(customerData: {
    name?: string;
    phone: string;
  }): Promise<void> {
    const loggedInUser = await usersRepository.getLoggedInUser();

    // Create payload for the changes table
    const payload = {
      ...customerData,
      tenantId: loggedInUser?.tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Track the change directly in the changes table
    await syncService.trackChange(
      "customer",
      0, // Using 0 as a placeholder since we don't have an ID yet
      SyncOperation.INSERT,
      payload
    );
  }

  // These methods are no longer needed as we're using changes table directly
}

export const customersRepository = new CustomersRepository();
