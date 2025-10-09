import { PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { inject, injectable } from "tsyringe";
import { DatabaseSchema } from "../../../db/schemas";
import { CustomersRepository } from "../repositories/customers.repository";
import { CustomerDTO } from "../types/customer.dto";

@injectable()
export class CustomersService {
  constructor(
    @inject(CustomersRepository)
    private readonly customersRepository: CustomersRepository
  ) {}
  /**
   * Get customers with optional search and pagination
   */
  async getCustomers(
    searchTerm: string | undefined,
    limit: number,
    offset: number,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<CustomerDTO[]> {
    return this.customersRepository.getCustomers(
      searchTerm,
      limit,
      offset,
      manager
    );
  }

  /**
   * Create a new customer or update if phone already exists
   * Business logic: Upsert based on phone number
   */
  async createCustomer(
    customerData: {
      name?: string;
      phone: string;
    },
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<CustomerDTO> {
    // Check if customer with same phone already exists
    const existingCustomer = await this.customersRepository.findByPhone(
      customerData.phone,
      manager
    );

    if (existingCustomer) {
      // Update existing customer
      await this.customersRepository.update(
        existingCustomer.id,
        customerData,
        manager
      );
      const updatedCustomer = await this.customersRepository.findById(
        existingCustomer.id,
        manager
      );
      if (!updatedCustomer) {
        throw new Error(
          `Failed to retrieve updated customer: ${existingCustomer.id}`
        );
      }
      return updatedCustomer;
    }

    // Create new customer
    return this.customersRepository.create(customerData, manager);
  }

  /**
   * Find customer by ID
   */
  async findById(
    id: string,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<CustomerDTO | null> {
    return this.customersRepository.findById(id, manager);
  }

  /**
   * Update customer visit data after a purchase
   * Business logic: Calculate totals and averages
   */
  async updateVisitData(
    id: string,
    amount: number,
    manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>
  ): Promise<void> {
    const customer = await this.findById(id, manager);

    if (!customer) {
      throw new Error(`Customer not found: ${id}`);
    }

    // Calculate new values
    const totalVisits = (customer.totalVisits || 0) + 1;
    const totalSpent = (customer.totalSpent || 0) + amount;
    const averageOrderValue = totalSpent / totalVisits;

    // Update customer
    await this.customersRepository.update(
      id,
      {
        totalVisits,
        totalSpent,
        averageOrderValue,
        lastVisitAt: new Date(),
      },
      manager
    );
  }
}
