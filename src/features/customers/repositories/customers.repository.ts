import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { desc, eq, like, or } from "drizzle-orm";
import { container } from "tsyringe";
import { v4 } from "uuid";
import { drizzleDb } from "../../../db";
import { DatabaseSchema, customers } from "../../../db/schemas";
import { usersRepository } from "../../users/repositories/users.repository";
import { CustomerDTO } from "../types/customer.dto";

export class CustomersRepository {
  /**
   * Get customers with optional search and pagination
   */
  async getCustomers(
    searchTerm: string | undefined,
    limit: number,
    offset: number,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<CustomerDTO[]> {
    const query = (manager ?? drizzleDb)
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

    return await query.execute();
  }

  /**
   * Create a new customer
   */
  async create(
    customerData: {
      name?: string;
      phone: string;
    },
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<CustomerDTO> {
    const loggedInUser = await usersRepository.getLoggedInUser();
    const localId = v4();
    const now = new Date();

    const payload = {
      ...customerData,
      id: localId,
      tenantId: loggedInUser?.tenantId,
      createdAt: now,
      updatedAt: now,
      localId,
    };

    await (manager ?? drizzleDb).insert(customers).values(payload).execute();

    const result = await this.findById(localId, manager);
    if (!result) {
      throw new Error("Failed to create customer");
    }
    return result;
  }

  /**
   * Update customer by ID
   */
  async update(
    id: string,
    customerData: Partial<{
      name?: string;
      phone?: string;
      totalVisits?: number;
      totalSpent?: number;
      averageOrderValue?: number;
      lastVisitAt?: Date;
    }>,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    await (manager ?? drizzleDb)
      .update(customers)
      .set({
        ...customerData,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
      .execute();
  }

  /**
   * Find customer by ID
   */
  async findById(
    id: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<CustomerDTO | null> {
    const result = await (manager ?? drizzleDb)
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1)
      .execute();

    if (!result || result.length === 0) {
      return null;
    }

    return result[0] as CustomerDTO;
  }

  /**
   * Find customer by phone
   */
  async findByPhone(
    phone: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<CustomerDTO | null> {
    const result = await (manager ?? drizzleDb)
      .select()
      .from(customers)
      .where(eq(customers.phone, phone))
      .limit(1)
      .execute();

    if (!result || result.length === 0) {
      return null;
    }

    return result[0] as CustomerDTO;
  }
}

container.registerSingleton(CustomersRepository);
