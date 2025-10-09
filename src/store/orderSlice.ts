import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CreateOrderItemDto,
  OrderDto,
  PreviewOrderDto,
} from "../features/orders/types/order.types";

interface OrderItem extends CreateOrderItemDto {
  tempId: string; // Temporary ID for UI tracking
}

interface OrderState {
  currentOrder: OrderDto | null;
  cartItems: OrderItem[];
  preview: PreviewOrderDto | null;
  isLoading: boolean;
  error: string | null;
  selectedCustomerId: string | null;
  selectedCustomerName: string | null;
  notes: string | null;
}

const initialState: OrderState = {
  currentOrder: null,
  cartItems: [],
  preview: null,
  isLoading: false,
  error: null,
  selectedCustomerId: null,
  selectedCustomerName: null,
  notes: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    // Initialize new order
    initializeOrder: (state, action: PayloadAction<OrderDto>) => {
      state.currentOrder = action.payload;
      state.cartItems = [];
      state.preview = null;
      state.error = null;
    },

    // Add item to cart
    addCartItem: (state, action: PayloadAction<CreateOrderItemDto>) => {
      // Check if variant already exists in cart
      const existingItem = state.cartItems.find(
        (item) =>
          item.variantId === action.payload.variantId &&
          item.stockType === action.payload.stockType
      );

      if (existingItem) {
        // Update quantity of existing item
        existingItem.quantity += action.payload.quantity;
      } else {
        // Add new item to cart
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        state.cartItems.push({
          ...action.payload,
          tempId,
        });
      }
    },

    // Update item quantity
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ tempId: string; quantity: number }>
    ) => {
      const item = state.cartItems.find(
        (i) => i.tempId === action.payload.tempId
      );
      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;
      }
    },

    // Remove item from cart
    removeCartItem: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(
        (i) => i.tempId !== action.payload
      );
    },

    // Clear cart
    clearCart: (state) => {
      state.cartItems = [];
      state.preview = null;
    },

    // Update preview
    updatePreview: (state, action: PayloadAction<PreviewOrderDto>) => {
      state.preview = action.payload;
    },

    // Set customer
    setCustomer: (
      state,
      action: PayloadAction<{ id: string; name: string } | null>
    ) => {
      if (action.payload) {
        state.selectedCustomerId = action.payload.id;
        state.selectedCustomerName = action.payload.name;
      } else {
        state.selectedCustomerId = null;
        state.selectedCustomerName = null;
      }
    },

    // Set notes
    setNotes: (state, action: PayloadAction<string>) => {
      state.notes = action.payload;
    },

    // Set loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Reset order
    resetOrder: () => initialState,

    // Complete order
    completeOrder: (state, action: PayloadAction<OrderDto>) => {
      state.currentOrder = action.payload;
      state.cartItems = [];
      state.preview = null;
    },
  },
});

export const {
  initializeOrder,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  updatePreview,
  setCustomer,
  setNotes,
  setLoading,
  setError,
  resetOrder,
  completeOrder,
} = orderSlice.actions;

export default orderSlice.reducer;

// Selectors
export const selectCurrentOrder = (state: { order: OrderState }) =>
  state.order.currentOrder;
export const selectCartItems = (state: { order: OrderState }) =>
  state.order.cartItems;
export const selectPreview = (state: { order: OrderState }) =>
  state.order.preview;
export const selectOrderLoading = (state: { order: OrderState }) =>
  state.order.isLoading;
export const selectOrderError = (state: { order: OrderState }) =>
  state.order.error;
export const selectSelectedCustomer = (state: { order: OrderState }) => ({
  id: state.order.selectedCustomerId,
  name: state.order.selectedCustomerName,
});
export const selectNotes = (state: { order: OrderState }) => state.order.notes;
export const selectCartItemCount = (state: { order: OrderState }) =>
  state.order.cartItems.length;
export const selectCartTotalQuantity = (state: { order: OrderState }) =>
  state.order.cartItems.reduce((sum, item) => sum + item.quantity, 0);
