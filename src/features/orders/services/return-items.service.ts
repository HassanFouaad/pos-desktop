import {
  CreateReturnItemData,
  returnItemsRepository,
} from "../repositories/return-items.repository";
import { ReturnItemDto } from "../types/return.types";

export class ReturnItemsService {
  /**
   * Find return items by return ID
   */
  async findByReturnId(returnId: string): Promise<ReturnItemDto[]> {
    return returnItemsRepository.findByReturnId(returnId);
  }

  /**
   * Create a new return item
   */
  async create(returnItemData: CreateReturnItemData): Promise<ReturnItemDto> {
    return returnItemsRepository.create(returnItemData);
  }

  /**
   * Create multiple return items in bulk
   */
  async createBulk(
    returnItemsData: CreateReturnItemData[]
  ): Promise<ReturnItemDto[]> {
    return returnItemsRepository.createBulk(returnItemsData);
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
    return returnItemsRepository.countByReturnId(returnId);
  }
}

export const returnItemsService = new ReturnItemsService();
