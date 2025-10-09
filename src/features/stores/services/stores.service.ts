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
   * Get the current tenant
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
   * Get the current POS
   */
  async getCurrentPos(): Promise<PosDTO | null> {
    return this.storesRepository.getCurrentPos();
  }
}
