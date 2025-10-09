# Multi-Tab Order System - Implementation Guide

## Overview

The POS application now supports concurrent order creation through a multi-tab system. This allows users to:

- Create multiple draft orders simultaneously
- Switch between orders seamlessly
- Maintain separate cart state for each order
- Auto-close tabs on completion/void
- Never lose work when switching between orders

## Architecture

### Redux State Structure

```typescript
interface OrderTab {
  id: string; // Unique tab identifier
  label: string; // Display name (e.g., "Order #1")
  currentOrder: OrderDto | null; // Completed order reference
  cartItems: OrderItem[]; // Items in this order's cart
  preview: PreviewOrderDto | null; // Calculated totals
  selectedCustomerId: string | null;
  selectedCustomerName: string | null;
  notes: string | null;
  createdAt: number; // Timestamp for ordering
}

interface OrderState {
  tabs: OrderTab[]; // All order tabs
  activeTabId: string | null; // Currently active tab
  nextTabNumber: number; // For sequential numbering
  isLoading: boolean;
  error: string | null;
}
```

### Key Features

1. **Tab Isolation**: Each tab maintains completely independent state
2. **No Database**: All tab state is Redux-only for instant performance
3. **Smart Tab Management**:
   - Auto-creates first tab on app load
   - Auto-creates new tab when last one is closed
   - Limit of 10 concurrent tabs for performance
4. **Touch-Optimized UI**: Large tap targets, smooth animations

## Components

### OrderTabBar

**Location**: `src/features/orders/components/OrderTabBar/OrderTabBar.tsx`

A horizontal scrollable tab bar showing all active orders:

- Shows order label and item count badge
- Highlights active tab
- Close button on each tab
- "+" button to create new tabs
- Auto-hides when only one empty tab exists

### CreateOrderPage (Updated)

**Location**: `src/features/orders/pages/CreateOrderPage.tsx`

- Added `OrderTabBar` at the top
- Ensures active tab on mount with `ensureActiveTab()`
- All operations work on the active tab automatically

### OrderActions (Updated)

**Location**: `src/features/orders/components/LeftPanel/OrderActions.tsx`

- Dispatches `completeOrder()` on successful completion → closes tab
- Dispatches `voidOrder()` on void → closes tab
- Both actions automatically create a new tab if none remain

## Redux Actions

### Tab Management

```typescript
createNewTab(); // Create empty tab, make it active
switchTab(tabId); // Switch to specified tab
closeTab(tabId); // Close tab, switch to adjacent or create new
updateTabLabel(tabId, label); // Update tab display name
ensureActiveTab(); // Ensure there's an active tab
```

### Order Operations (Scoped to Active Tab)

```typescript
addCartItem(item); // Add to active tab's cart
updateCartItemQuantity(); // Update quantity in active tab
removeCartItem(tempId); // Remove from active tab
clearCart(); // Clear active tab's cart
updatePreview(preview); // Update active tab's preview
setCustomer(customer); // Set customer for active tab
setNotes(notes); // Set notes for active tab
completeOrder(order); // Complete and close active tab
voidOrder(); // Void and close active tab
```

## Selectors

All existing selectors work with the active tab:

```typescript
selectTabs; // All tabs
selectActiveTabId; // Current active tab ID
selectActiveTab; // Full active tab object
selectCartItems; // Active tab's cart items
selectPreview; // Active tab's preview
selectCurrentOrder; // Active tab's order
selectSelectedCustomer; // Active tab's customer
selectNotes; // Active tab's notes
selectCartItemCount; // Active tab's item count
selectCartTotalQuantity; // Active tab's total quantity
```

## Usage Flow

### Creating Orders

1. User adds items to cart in Tab 1
2. User clicks "+" to create Tab 2
3. User adds different items to Tab 2
4. User can switch between tabs freely
5. Each tab maintains its own cart state

### Completing Orders

1. User clicks "Pay" in active tab
2. Payment modal appears
3. On payment, order is created in PENDING status
4. Complete dialog shows
5. User clicks "Complete Order"
6. Order moves to COMPLETED status
7. Tab automatically closes
8. Switches to next tab or creates new one

### Voiding Orders

1. User clicks "Void Order" in complete dialog
2. Order is voided in database
3. Inventory reservations released
4. Tab automatically closes
5. Switches to next tab or creates new one

## Edge Cases Handled

1. **Last Tab Closed**: Automatically creates a new empty tab
2. **No Active Tab**: First tab becomes active automatically
3. **Maximum Tabs**: Limited to 10 tabs (configurable)
4. **Empty Tab**: Tab bar hides when only one empty tab exists
5. **Tab Switching**: Preserves all state when switching
6. **Order Completion**: Closes tab after successful completion
7. **Order Void**: Closes tab and releases inventory

## Performance Considerations

- **Redux Only**: No database queries for tab management
- **Isolated State**: Each tab's operations don't affect others
- **Efficient Updates**: Only active tab preview is calculated
- **Lazy Loading**: Categories/products loaded on demand per tab

## Future Enhancements

Potential improvements for future versions:

1. **Tab Persistence**: Save tabs to localStorage for page refresh recovery
2. **Tab Reordering**: Drag-and-drop to reorder tabs
3. **Named Tabs**: Allow custom tab names (e.g., "Table 5", "John's Order")
4. **Tab Colors**: Color-code tabs by customer or status
5. **Quick Actions**: Right-click context menu on tabs
6. **Tab History**: Recently closed tabs recovery
7. **Tab Shortcuts**: Keyboard shortcuts (Ctrl+1-9 to switch tabs)
8. **Tab Templates**: Save common order configurations

## Testing Checklist

- [ ] Create new tab
- [ ] Switch between tabs
- [ ] Add items to different tabs
- [ ] Close tab manually
- [ ] Complete order (tab closes)
- [ ] Void order (tab closes)
- [ ] Last tab closed (new tab created)
- [ ] Maximum tabs limit (10 tabs)
- [ ] Tab state preserved on switch
- [ ] Preview updates per tab
- [ ] Customer selection per tab
- [ ] Notes per tab

## Component Reusability

The implementation follows the project's reusability principles:

- **TouchButton**: Used for all interactive buttons
- **Chip**: MUI Chip for tab display
- **IconButton**: For new tab button
- **Box/Grid**: MUI layout components
- **Theme-based styling**: All colors from theme palette
- **No custom CSS**: Relies on MUI sx props

## Design Decisions

1. **Redux Over Database**: Tabs are ephemeral UI state, not persisted data
2. **Auto-Close on Complete**: Prevents tab clutter after order completion
3. **Auto-Create on Empty**: Ensures always ready for new orders
4. **Limited Tabs**: 10 tab limit prevents performance degradation
5. **Touch-First**: Large tap targets (44px minimum) for tablet use
6. **Visual Feedback**: Active tab clearly highlighted
7. **Item Badges**: Show item count for quick reference
