import { CreateOrderItemDto } from "./order.types";

export interface OrderTabItem extends CreateOrderItemDto {
  tempId: string;
}

export interface OrderTabState {
  id: string;
  label: string;
  cartItems: OrderTabItem[];
  selectedCustomerId: string | null;
  selectedCustomerName: string | null;
  notes: string | null;
  createdAt: number;
}
