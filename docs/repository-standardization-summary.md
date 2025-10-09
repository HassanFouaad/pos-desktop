# Repository Standardization Summary

## Overview

All repositories have been standardized to follow a consistent pattern for better maintainability, type safety, and transaction support.

## Standard Repository Pattern

### 1. **Consistent Structure**

- No constructors - use `drizzleDb` directly
- All DTOs imported from types files (no local interfaces)
- All methods support optional `manager` parameter for transactions
- Consistent date/boolean mapping when converting from DB to DTO
- Return DTOs, not raw DB results
- No business logic in repositories

### 2. **Method Signatures**

```typescript
// Create
async create(data: CreateDto, manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>): Promise<Dto>

// Find by ID
async findById(id: string, manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>): Promise<Dto | null>

// Update
async update(id: string, data: Partial<Dto>, manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>): Promise<void>

// Delete
async delete(id: string, manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>): Promise<void>

// Custom queries
async findByX(params, manager?: PowerSyncSQLiteDatabase<typeof DatabaseSchema>): Promise<Dto[]>
```

### 3. **Date/Boolean Mapping**

All repositories consistently map dates and booleans:

```typescript
return {
  ...dbResult,
  booleanField: Boolean(dbResult.booleanField),
  dateField: new Date(dbResult.dateField!),
} as Dto;
```

## Changes Made

### 1. **Created Type Files**

- **`inventory/types/inventory.types.ts`** - New file with:
  - `InventoryDto`
  - `InventoryAdjustmentDto`
  - `CreateInventoryAdjustmentDto`
  - `ReserveStockParams`

### 2. **Updated Type Files**

- **`orders/types/order.types.ts`** - Added:
  - `CreateOrderHistoryDto` interface
- **`orders/types/return.types.ts`** - Added:
  - `CreateReturnDataDto` interface

### 3. **Refactored Repositories**

#### **customers.repository.ts**

**Changes:**

- ✅ Removed constructor and `this.db`
- ✅ Added `manager` parameter to all methods
- ✅ Added `findById()` method
- ✅ Consistent use of `drizzleDb` directly
- ✅ Improved date handling

**Key Methods:**

- `getCustomers(searchTerm, limit, offset, manager?)` - Added manager support
- `createCustomer(data, manager?)` - Added manager support
- `findById(id, manager?)` - New method
- `updateVisitData(id, amount, manager?)` - Added manager support

#### **inventory.repository.ts**

**Changes:**

- ✅ Removed local DTO definitions
- ✅ Import DTOs from `types/inventory.types.ts`
- ✅ Improved type safety with `ReserveStockParams`

**Key Methods:**

- `findByVariantAndStore(variantId, storeId, manager?)`
- `reserveStock(params: ReserveStockParams, manager?)`
- `consumeStock(...params, manager?)`
- `releaseStock(...params, manager?)`
- `returnStock(...params, manager?)`

#### **order-history.repository.ts**

**Changes:**

- ✅ Removed local `CreateOrderHistoryData` interface
- ✅ Import `CreateOrderHistoryDto` from types

**Key Methods:**

- `create(data: CreateOrderHistoryDto, manager?)`
- `findById(id, manager?)`
- `findByOrderId(orderId, manager?)`

#### **order-items.repository.ts**

**Changes:**

- ✅ Improved type safety with `Omit` utility types
- ✅ Added return types (return IDs from create methods)
- ✅ Added proper date/boolean mapping in `findManyByIds()`
- ✅ Added empty array check in `createBulk()`

**Key Methods:**

- `createItem(data, manager?)` - Now returns `string` (item ID)
- `createBulk(items, manager?)` - Now returns `string[]` (item IDs)
- `findManyByIds(ids, manager?)` - Improved mapping
- `findById(id, manager?)`
- `findByOrderId(orderId, manager?)`
- `updateItem(id, data, manager?)`
- `deleteItem(id, manager?)`
- `deleteByOrderId(orderId, manager?)`
- `bulkUpdate(updates, manager?)`

#### **return-items.repository.ts**

**Changes:**

- ✅ Added PowerSyncSQLiteDatabase import
- ✅ Added `manager` parameter to ALL methods
- ✅ Improved type safety with `Omit` utility types
- ✅ Consistent use of `(manager ?? drizzleDb)`

**Key Methods:**

- `create(data, manager?)` - Added manager support
- `createBulk(items, manager?)` - Added manager support
- `findById(id, manager?)` - Added manager support
- `findByReturnId(returnId, manager?)` - Added manager support
- `countByReturnId(returnId, manager?)` - Added manager support

#### **orders.repository.ts**

**Changes:**

- ✅ Improved `findById()` to properly fetch and map items
- ✅ Better date mapping for all date fields
- ✅ Improved type safety in `updateOrder()`
- ✅ Better handling of `orderDate` in `createOrder()`

**Key Methods:**

- `createOrder(data, storeCode, manager?)` - Improved date handling
- `findById(id, manager?)` - Now properly fetches items separately and maps dates
- `updateOrder(id, data, manager?)` - Improved type safety

#### **returns.repository.ts**

**Changes:**

- ✅ Removed local `CreateReturnData` interface
- ✅ Import `CreateReturnDataDto` from types
- ✅ Improved type safety in `update()`
- ✅ Fixed manager parameter passing in `findByOriginalOrderId()`

**Key Methods:**

- `create(data: CreateReturnDataDto, manager?)`
- `findById(id, manager?)`
- `update(id, data, manager?)` - Improved type safety
- `findByOriginalOrderId(orderId, manager?)` - Fixed manager passing
- `findByStoreId(storeId, limit, manager?)`

## Benefits of Standardization

### 1. **Type Safety**

- All DTOs centralized in type files
- Consistent use of TypeScript utility types (`Omit`, `Partial`)
- No `any` or `unknown` types

### 2. **Transaction Support**

- All repository methods support optional transaction manager
- Enables atomic multi-step operations
- Better data consistency

### 3. **Maintainability**

- Consistent patterns across all repositories
- Easy to understand and modify
- Reduced code duplication

### 4. **Testability**

- Clear separation of concerns
- Easy to mock for testing
- Consistent interfaces

### 5. **Developer Experience**

- Predictable method signatures
- Better IDE autocomplete
- Clear documentation through types

## Migration Guide

### For Services Using These Repositories

**Before:**

```typescript
// Old pattern - some repos didn't support transactions
await customersRepository.createCustomer(data);
await ordersRepository.createOrder(data, storeCode);
```

**After:**

```typescript
// New pattern - all repos support transactions
await db.executeWrite(async (tx) => {
  await customersRepository.createCustomer(data, tx);
  await ordersRepository.createOrder(data, storeCode, tx);
});
```

### Breaking Changes

1. **order-items.repository.ts**

   - `createItem()` now returns `string` instead of `void`
   - `createBulk()` now returns `string[]` instead of `void`

2. **All repositories**
   - All methods now accept optional `manager` parameter as last argument
   - Ensure services pass manager when using transactions

## Testing Recommendations

1. Test all repository methods with and without transaction manager
2. Test date/boolean mapping consistency
3. Test error handling with invalid data
4. Test transaction rollback scenarios

## Next Steps

1. Update service layer to use transaction support
2. Add unit tests for all repository methods
3. Add integration tests for transaction scenarios
4. Update service documentation with new patterns
