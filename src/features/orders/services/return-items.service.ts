import { inject, injectable } from "tsyringe";
import { ReturnItemsRepository } from "../repositories/return-items.repository";
import { ReturnItemDto } from "../types/return.types";

@injectable()
export class ReturnItemsService {
  constructor(
    @inject(ReturnItemsRepository)
    private readonly returnItemsRepository: ReturnItemsRepository
  ) {}
  /**
   * Find return items by return ID
   */
  async findByReturnId(returnId: string): Promise<ReturnItemDto[]> {
    return this.returnItemsRepository.findByReturnId(returnId);
  }

  /**
   * Create a new return item
   */
  async create(
    returnItemData: Omit<ReturnItemDto, "id" | "createdAt">
  ): Promise<ReturnItemDto> {
    return this.returnItemsRepository.create(returnItemData);
  }

  /**
   * Create multiple return items in bulk
   */
  async createBulk(
    returnItemsData: Omit<ReturnItemDto, "id" | "createdAt">[]
  ): Promise<ReturnItemDto[]> {
    return this.returnItemsRepository.createBulk(returnItemsData);
  }

  /**
   * Calculate total refund amount for a set of return items
   */
  calculateTotalRefundAmount(
    returnItems: { quantityReturned: number; unitRefundAmount: number }[]
  ): number {
    return returnItems.reduce(
      (total, item) => total + item.quantityReturned * item.unitRefundAmount,
      0
    );
  }

  /**
   * Count return items by return ID
   */
  async countByReturnId(returnId: string): Promise<number> {
    return this.returnItemsRepository.countByReturnId(returnId);
  }
}
