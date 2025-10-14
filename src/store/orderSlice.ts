import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CreateOrderItemDto,
  OrderDto,
  PreviewOrderDto,
} from "../features/orders/types/order.types";

interface OrderItem extends CreateOrderItemDto {
  tempId: string; // Temporary ID for UI tracking
  quantityAvailable?: number; // Available inventory for validation
}

interface OrderTab {
  id: string; // Unique tab ID
  label: string; // "Order #1", "Order #2", etc.
  currentOrder: OrderDto | null;
  cartItems: OrderItem[];
  preview: PreviewOrderDto | null;
  selectedCustomerId: string | null;
  selectedCustomerName: string | null;
  notes: string | null;
  createdAt: number; // Timestamp for ordering
}

interface OrderState {
  tabs: OrderTab[];
  activeTabId: string | null;
  nextTabNumber: number; // For generating sequential labels
  isLoading: boolean;
  error: string | null;
}

const createEmptyTab = (tabNumber: number): OrderTab => ({
  id: `tab-${Date.now()}-${Math.random()}`,
  label: `Order #${tabNumber}`,
  currentOrder: null,
  cartItems: [],
  preview: null,
  selectedCustomerId: null,
  selectedCustomerName: null,
  notes: null,
  createdAt: Date.now(),
});

const initialState: OrderState = {
  tabs: [createEmptyTab(1)],
  activeTabId: null, // Will be set on first access
  nextTabNumber: 2,
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    // Tab Management
    createNewTab: (state) => {
      const newTab = createEmptyTab(state.nextTabNumber);
      state.tabs.push(newTab);
      state.activeTabId = newTab.id;
      state.nextTabNumber += 1;
    },

    switchTab: (state, action: PayloadAction<string>) => {
      const tabExists = state.tabs.find((tab) => tab.id === action.payload);
      if (tabExists) {
        state.activeTabId = action.payload;
      }
    },

    closeTab: (state, action: PayloadAction<string>) => {
      const tabIndex = state.tabs.findIndex((tab) => tab.id === action.payload);
      if (tabIndex === -1) return;

      // Remove the tab
      state.tabs.splice(tabIndex, 1);

      // If we closed the active tab, switch to another
      if (state.activeTabId === action.payload) {
        if (state.tabs.length > 0) {
          // Switch to the next tab, or previous if we closed the last one
          const newIndex =
            tabIndex < state.tabs.length ? tabIndex : tabIndex - 1;
          state.activeTabId = state.tabs[newIndex].id;
        } else {
          // No tabs left, create a new one
          const newTab = createEmptyTab(state.nextTabNumber);
          state.tabs.push(newTab);
          state.activeTabId = newTab.id;
          state.nextTabNumber += 1;
        }
      }
    },

    updateTabLabel: (
      state,
      action: PayloadAction<{ tabId: string; label: string }>
    ) => {
      const tab = state.tabs.find((t) => t.id === action.payload.tabId);
      if (tab) {
        tab.label = action.payload.label;
      }
    },

    // Helper to get active tab (used in reducers)
    ensureActiveTab: (state) => {
      if (!state.activeTabId && state.tabs.length > 0) {
        state.activeTabId = state.tabs[0].id;
      }
    },

    // Order Operations (all operate on active tab)
    addCartItem: (
      state,
      action: PayloadAction<CreateOrderItemDto & { quantityAvailable?: number }>
    ) => {
      const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
      if (!activeTab) return;

      // Check if variant already exists in cart
      const existingItem = activeTab.cartItems.find(
        (item) =>
          item.variantId === action.payload.variantId &&
          item.stockType === action.payload.stockType
      );

      const newQuantity = action.payload.quantity;
      const quantityAvailable = action.payload.quantityAvailable;

      if (existingItem) {
        // Validate against available inventory if provided
        if (
          quantityAvailable !== undefined &&
          existingItem.quantity + newQuantity > quantityAvailable
        ) {
          // Don't add if it would exceed available stock
          console.warn(
            `Cannot add ${newQuantity} more. Would exceed available stock of ${quantityAvailable}`
          );
          return;
        }
        existingItem.quantity += newQuantity;
        // Update quantityAvailable if provided
        if (quantityAvailable !== undefined) {
          existingItem.quantityAvailable = quantityAvailable;
        }
      } else {
        // Validate for new item
        if (
          quantityAvailable !== undefined &&
          newQuantity > quantityAvailable
        ) {
          console.warn(
            `Cannot add ${newQuantity}. Exceeds available stock of ${quantityAvailable}`
          );
          return;
        }
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        activeTab.cartItems.push({
          ...action.payload,
          tempId,
          quantityAvailable,
        });
      }
    },

    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ tempId: string; quantity: number }>
    ) => {
      const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
      if (!activeTab) return;

      const item = activeTab.cartItems.find(
        (i) => i.tempId === action.payload.tempId
      );
      if (item && action.payload.quantity > 0) {
        // Validate against available inventory if provided
        if (
          item.quantityAvailable !== undefined &&
          action.payload.quantity > item.quantityAvailable
        ) {
          console.warn(
            `Cannot set quantity to ${action.payload.quantity}. Exceeds available stock of ${item.quantityAvailable}`
          );
          return;
        }
        item.quantity = action.payload.quantity;
      }
    },

    removeCartItem: (state, action: PayloadAction<string>) => {
      const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
      if (!activeTab) return;

      activeTab.cartItems = activeTab.cartItems.filter(
        (i) => i.tempId !== action.payload
      );
    },

    clearCart: (state) => {
      const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
      if (!activeTab) return;

      activeTab.cartItems = [];
      activeTab.preview = null;
    },

    updatePreview: (state, action: PayloadAction<PreviewOrderDto>) => {
      const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
      if (!activeTab) return;

      activeTab.preview = action.payload;
    },

    setCustomer: (
      state,
      action: PayloadAction<{ id: string; name: string } | null>
    ) => {
      const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
      if (!activeTab) return;

      if (action.payload) {
        activeTab.selectedCustomerId = action.payload.id;
        activeTab.selectedCustomerName = action.payload.name;
      } else {
        activeTab.selectedCustomerId = null;
        activeTab.selectedCustomerName = null;
      }
    },

    setNotes: (state, action: PayloadAction<string>) => {
      const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
      if (!activeTab) return;

      activeTab.notes = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Complete order - closes the tab
    completeOrder: (state, action: PayloadAction<OrderDto>) => {
      const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
      if (!activeTab) return;

      activeTab.currentOrder = action.payload;

      // Close the tab after completion
      const tabId = state.activeTabId;
      if (tabId) {
        const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
        if (tabIndex !== -1) {
          state.tabs.splice(tabIndex, 1);

          if (state.tabs.length > 0) {
            const newIndex =
              tabIndex < state.tabs.length ? tabIndex : tabIndex - 1;
            state.activeTabId = state.tabs[newIndex].id;
          } else {
            const newTab = createEmptyTab(state.nextTabNumber);
            state.tabs.push(newTab);
            state.activeTabId = newTab.id;
            state.nextTabNumber += 1;
          }
        }
      }
    },

    // Void order - closes the tab
    voidOrder: (state) => {
      const tabId = state.activeTabId;
      if (!tabId) return;

      const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
      if (tabIndex !== -1) {
        state.tabs.splice(tabIndex, 1);

        if (state.tabs.length > 0) {
          const newIndex =
            tabIndex < state.tabs.length ? tabIndex : tabIndex - 1;
          state.activeTabId = state.tabs[newIndex].id;
        } else {
          const newTab = createEmptyTab(state.nextTabNumber);
          state.tabs.push(newTab);
          state.activeTabId = newTab.id;
          state.nextTabNumber += 1;
        }
      }
    },

    // Reset all
    resetAllOrders: () => initialState,
  },
});

export const {
  createNewTab,
  switchTab,
  closeTab,
  updateTabLabel,
  ensureActiveTab,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  updatePreview,
  setCustomer,
  setNotes,
  setLoading,
  setError,
  completeOrder,
  voidOrder,
  resetAllOrders,
} = orderSlice.actions;

export default orderSlice.reducer;

// Helper to get active tab
const getActiveTab = (state: { order: OrderState }) => {
  const { tabs, activeTabId } = state.order;

  // Ensure we have an active tab
  if (!activeTabId && tabs.length > 0) {
    return tabs[0];
  }

  return tabs.find((tab) => tab.id === activeTabId) || null;
};

// Selectors - all work with active tab
export const selectTabs = (state: { order: OrderState }) => state.order.tabs;

export const selectActiveTabId = (state: { order: OrderState }) =>
  state.order.activeTabId ||
  (state.order.tabs.length > 0 ? state.order.tabs[0].id : null);

export const selectActiveTab = (state: { order: OrderState }) =>
  getActiveTab(state);

export const selectCurrentOrder = (state: { order: OrderState }) =>
  getActiveTab(state)?.currentOrder || null;

export const selectCartItems = (state: { order: OrderState }) =>
  getActiveTab(state)?.cartItems || [];

export const selectPreview = (state: { order: OrderState }) =>
  getActiveTab(state)?.preview || null;

export const selectOrderLoading = (state: { order: OrderState }) =>
  state.order.isLoading;

export const selectOrderError = (state: { order: OrderState }) =>
  state.order.error;

export const selectSelectedCustomer = (state: { order: OrderState }) => {
  const activeTab = getActiveTab(state);
  return {
    id: activeTab?.selectedCustomerId || null,
    name: activeTab?.selectedCustomerName || null,
  };
};

export const selectNotes = (state: { order: OrderState }) =>
  getActiveTab(state)?.notes || null;

export const selectCartItemCount = (state: { order: OrderState }) =>
  getActiveTab(state)?.cartItems.length || 0;

export const selectCartTotalQuantity = (state: { order: OrderState }) =>
  getActiveTab(state)?.cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  ) || 0;
