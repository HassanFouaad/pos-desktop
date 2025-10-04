import { desc, ilike, or } from "drizzle-orm";
import { v4 } from "uuid";
import { DrizzleDb, drizzleDb } from "../../../db/drizzle";
import { customers } from "../../../db/schemas";
import { syncService } from "../../../db/sync/sync.service";
import { SyncOperation, SyncStatus } from "../../../db/sync/types";
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
        syncStatus: SyncStatus.PENDING,
      })
      .execute();

    // Track the change directly in the changes table
    await syncService.trackChange(
      "customer",
      localId, // Using empty string as a placeholder since we don't have an ID yet
      SyncOperation.INSERT,
      payload,
      localId
    );
  }
}

export const customersRepository = new CustomersRepository();
