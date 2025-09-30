import { desc, eq, ilike, or } from "drizzle-orm";
import { v4 } from "uuid";
import { DrizzleDb, drizzleDb } from "../../../db/drizzle";
import { customers, pendingCustomers } from "../../../db/schemas";
import {
  SyncOperation,
  syncService,
  SyncStatus,
} from "../../../db/sync/sync.service";
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

    const pendingQuery = this.db
      .select()
      .from(pendingCustomers)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(pendingCustomers.createdAt));

    pendingQuery.where(eq(pendingCustomers.syncStatus, SyncStatus.PENDING));

    if (searchTerm) {
      query.where(
        or(
          ilike(customers.name, `%${searchTerm}%`),
          ilike(customers.phone, `%${searchTerm}%`)
        )
      );
      pendingQuery.where(
        or(
          ilike(pendingCustomers.name, `%${searchTerm}%`),
          ilike(pendingCustomers.phone, `%${searchTerm}%`)
        )
      );
    }
    const [customersData, pendingCustomersData] = await Promise.all([
      query.execute(),
      pendingQuery.execute(),
    ]);

    return [...pendingCustomersData, ...customersData];
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
      tenantId: loggedInUser?.tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
      localId,
    };

    await this.db
      .insert(pendingCustomers)
      .values({
        ...payload,
        syncStatus: SyncStatus.PENDING,
      })
      .execute();

    // Track the change directly in the changes table
    await syncService.trackChange(
      "customer",
      0, // Using 0 as a placeholder since we don't have an ID yet
      SyncOperation.INSERT,
      payload,
      localId
    );
  }

  async changePendingCustomerStatus(
    localId: string,
    status: Exclude<SyncStatus, SyncStatus.RETRY>
  ): Promise<void> {
    await this.db
      .update(pendingCustomers)
      .set({ syncStatus: status })
      .where(eq(pendingCustomers.localId, localId))
      .execute();
  }

  // These methods are no longer needed as we're using changes table directly
}

export const customersRepository = new CustomersRepository();
