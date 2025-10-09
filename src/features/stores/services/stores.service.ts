import { inject, injectable } from "tsyringe";
import { StoresRepository } from "../repositories/stores.repository";
import { PosDTO, StoreDto, TenantDto } from "../types";

@injectable()
export class StoresService {
  constructor(
    @inject(StoresRepository)
    private readonly storesRepository: StoresRepository
  ) {}

  /**
   * Get current tenant data from local DB
   */
  async getCurrentTenant(): Promise<TenantDto | null> {
    return this.storesRepository.getCurrentTenant();
  }

  /**
   * Get the current store
   */
  async getCurrentStore(): Promise<StoreDto | null> {
    return this.storesRepository.getCurrentStore();
  }

  /**
   * Get current POS device data from local DB
   */
  async getCurrentPos(): Promise<PosDTO | null> {
    return this.storesRepository.getCurrentPos();
  }
}
