# Orders Module - Desktop POS

This module handles the complete order creation flow in the desktop POS application with offline-first architecture.

## Architecture

### Data Layer (Repositories)

- **OrdersRepository**: Manages order CRUD operations and order number generation
- **OrderItemsRepository**: Handles order line items
- **InventoryRepository**: Manages stock operations (reserve, consume, release)

### Business Layer (Services)

- **OrderItemsService**: Calculates line item totals, taxes, and discounts (matches backend logic)
- **OrdersService**: Handles order lifecycle (create, preview, complete, void)

### State Management (Redux)

- **orderSlice**: Manages current order state, cart items, and preview

### UI Components

#### Main Page

- **CreateOrderPage**: Two-panel layout with cart on left, products on right

#### Left Panel (Order Details)

- **OrderCart**: Displays cart items with quantity controls
- **OrderTotals**: Shows subtotal, tax, and total
- **OrderActions**: Complete and Void buttons

#### Right Panel (Product Selection)

- **CategoryGrid**: Touch-optimized category tiles
- **ProductGrid**: Touch-optimized product tiles

#### Modals

- **VariantSelectorModal**: Multi-variant product selection with stock info
- **PaymentModal**: Payment amount entry with quick buttons and change calculation
- **OrderConfirmationDialog**: Success confirmation with change display

## Order Flow

### 1. Add Items to Cart

```typescript
// Add items to cart (in memory, not DB yet)
dispatch(
  addCartItem({
    variantId: "variant-123",
    quantity: 1,
    stockType: OrderItemStockType.INVENTORY,
  })
);
```

### 2. Real-Time Preview

```typescript
// Automatically updates on every cart change
const preview = await ordersService.previewOrder(cartItems, storeId);
// Returns: subtotal, tax, total, line-by-line calculations
```

### 3. Create Order with Payment

```typescript
// Creates order in PENDING status with all items and reserves inventory
const order = await ordersService.createOrder({
  storeId,
  items: cartItems.map(({ tempId, ...item }) => item),
  customerId: "optional-customer-id",
  notes: "Optional order notes",
});
// This automatically:
// - Validates stock availability
// - Calculates all totals
// - Creates order with items
// - Reserves inventory
```

### 4. Complete Order

```typescript
// Consume inventory and finalize
const completedOrder = await ordersService.completeOrder({
  orderId: order.id,
  paymentMethod: PaymentMethod.CASH,
  amountPaid: 100.0,
});
// Returns: completed order with change calculated
// This automatically:
// - Consumes inventory (decreases onHand and committed)
// - Updates order status to COMPLETED
// - Records payment details
```

### 5. Void Order (Optional)

```typescript
// Release all reserved inventory
await ordersService.voidOrder({
  orderId: order.id,
  reason: "Customer cancelled",
});
// This automatically:
// - Releases inventory (decreases committed)
// - Updates order status to VOIDED
```

## Inventory Management

### Reserve Stock (on order creation)

- Triggered when `createOrder()` is called
- Increases `quantityCommitted`
- Decreases `quantityAvailable`
- Creates `SALE` type adjustment record with 0 quantity change
- Validates stock availability before reservation

### Consume Stock (on order complete)

- Triggered when `completeOrder()` is called
- Decreases `quantityOnHand`
- Decreases `quantityCommitted`
- Recalculates `quantityAvailable`
- Creates `SALE` type adjustment with negative quantity change
- Updates total inventory value

### Release Stock (on order void)

- Triggered when `voidOrder()` is called
- Decreases `quantityCommitted`
- Increases `quantityAvailable`
- Creates `RELEASE` type adjustment with 0 quantity change
- Restores availability without changing on-hand quantity

## Tax Calculation

Matches backend logic exactly:

```typescript
// If tax is included in price
unitPriceWithoutTax = price - (price * taxRate) / 100;

// If tax is not included
taxAmount = (price * taxRate) / 100;
```

## Design Style

- **Touch-First**: Large buttons optimized for touch screens
- **Glassy Modern**: No elevations, subtle borders, backdrop blur effects
- **Digital POS Aesthetic**: Clean, minimalist, professional
- **Real-Time Feedback**: Instant preview updates on any change

## Usage Example

```typescript
import { CreateOrderPage } from "@/features/orders";

// In your router
<Route path="/orders/create" element={<CreateOrderPage />} />;
```

## Database Schema

Uses DrizzleORM with SQLite:

- `orders` - Order records
- `order_items` - Line items
- `inventory` - Stock levels
- `inventory_adjustments` - Stock movement history

## Sync Strategy

All operations are performed locally first (offline-first):

1. Orders created with `syncStatus: PENDING`
2. PowerSync handles background sync to server
3. Server validates and updates
4. Changes synced back to local DB

## Testing

```bash
# Run unit tests
npm test orders

# Run integration tests
npm test orders:integration
```

## Future Enhancements

- [ ] Receipt printing
- [ ] Multiple payment methods (split payment)
- [ ] Discount application
- [ ] Customer loyalty points
- [ ] Order search and history
- [ ] Refunds and returns
- [ ] Barcode scanning

```

```
