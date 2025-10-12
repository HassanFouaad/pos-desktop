import { inject, injectable } from "tsyringe";
import { StorePaymentMethodsRepository } from "../repositories/store-payment-methods.repository";
import { StorePaymentMethodDto } from "../types";

@injectable()
export class StorePaymentMethodsService {
  constructor(
    @inject(StorePaymentMethodsRepository)
    private readonly storePaymentMethodsRepository: StorePaymentMethodsRepository
  ) {}

  /**
   * Get all active payment methods for a store
   * This is the primary method used in the checkout flow
   */
  async getActivePaymentMethods(
    storeId: string
  ): Promise<StorePaymentMethodDto[]> {
    return this.storePaymentMethodsRepository.findActiveByStoreId(storeId);
  }

  /**
   * Get all payment methods (active and inactive) for a store
   */
  async getAllPaymentMethods(
    storeId: string
  ): Promise<StorePaymentMethodDto[]> {
    return this.storePaymentMethodsRepository.findByStoreId(storeId);
  }

  /**
   * Get payment method by ID
   */
  async getPaymentMethodById(
    id: string
  ): Promise<StorePaymentMethodDto | null> {
    return this.storePaymentMethodsRepository.findById(id);
  }
}

