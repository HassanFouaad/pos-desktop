# Real-Time Store Status Monitoring

## Overview

This document describes the implementation of real-time store status monitoring using PowerSync watched queries. The system automatically detects when a store is deactivated and blocks all POS operations until the store is reactivated.

## Architecture

### Components

#### 1. `useStoreStatus` Hook (`src/hooks/useStoreStatus.ts`)

A custom React hook that monitors the store's `isActive` status in real-time using PowerSync's watched queries.

**Features:**

- Uses PowerSync's `watch()` method to monitor database changes
- Automatically updates when store status changes in the database
- Falls back gracefully if store ID is not available
- Returns loading state, active status, and store data

**API:**

```typescript
const { isActive, loading, storeData } = useStoreStatus();
```

**How it works:**

1. Retrieves the current store ID from Redux global state
2. Sets up a PowerSync watched query on the stores table
3. Monitors the `isActive` field for changes
4. Updates component state when changes are detected
5. Cleans up the watch subscription on unmount

#### 2. `StoreInactiveBlocker` Component (`src/components/layouts/StoreInactiveBlocker.tsx`)

A full-screen blocker overlay that displays when the store is inactive.

**Features:**

- Full-screen backdrop with blur effect
- Modern warning sign with animated pulse
- Store information display
- Real-time status monitoring indicator
- Uses existing MUI components and theme
- Automatically dismisses when store is reactivated

**UI Elements:**

- ⚠️ Warning icon with pulsing animation
- Store name and code
- Clear warning message
- Loading indicator showing active monitoring
- Help text explaining automatic dismissal

#### 3. Integration in App (`src/App.tsx`)

The blocker is integrated at the root level of the application, ensuring it blocks all routes and operations when the store is inactive.

**Placement:**

```tsx
<>
  <StoreInactiveBlocker />
  <Router>{/* All routes */}</Router>
</>
```

### Database Schema

The stores table includes an `isActive` field:

```typescript
isActive: integer("isActive", { mode: "boolean" });
```

### PowerSync Integration

The implementation uses PowerSync's watched queries feature which provides:

- Real-time synchronization
- Automatic updates when data changes
- Efficient change detection
- Automatic cleanup

## Usage

### For Users

When a store is deactivated:

1. All POS operations are immediately suspended
2. A full-screen warning message appears
3. The message remains until the store is reactivated
4. Operations automatically resume when the store is reactivated

### For Administrators

To deactivate a store:

```sql
UPDATE stores SET isActive = 0 WHERE id = 'store_id';
```

To reactivate a store:

```sql
UPDATE stores SET isActive = 1 WHERE id = 'store_id';
```

The changes will be immediately reflected on all connected POS devices.

## Technical Details

### PowerSync Watch Query

```typescript
powerSyncDb.watch(
  `SELECT id, name, code, isActive FROM stores WHERE id = ?`,
  [storeId],
  {
    onResult: (result) => {
      // Handle updates
    },
    onError: (error) => {
      // Handle errors
    },
  }
);
```

### Behavior

- **Default State:** Active (if no data or on error)
- **Loading State:** Shows while initial data is being fetched
- **Active Store:** No blocker shown, normal operations
- **Inactive Store:** Full-screen blocker displayed, all operations suspended
- **Real-time Updates:** Changes reflected immediately without page refresh

## Styling

- Uses existing MUI theme components
- Follows current design system
- Responsive layout
- Touch-friendly design
- Supports light and dark modes
- Animated elements for visual feedback

## Error Handling

- Graceful fallback if store ID not available
- Defaults to active state on errors
- Logs errors to console for debugging
- Continues monitoring even after errors

## Performance

- Efficient change detection via PowerSync
- Minimal re-renders using React hooks
- Automatic cleanup of subscriptions
- No polling or repeated queries needed

## Testing Scenarios

### 1. Store Deactivation

1. Open POS application
2. Deactivate the store from admin panel
3. Verify blocker appears immediately
4. Verify all operations are blocked

### 2. Store Reactivation

1. With blocker visible
2. Reactivate the store from admin panel
3. Verify blocker disappears immediately
4. Verify operations resume normally

### 3. Multiple Devices

1. Open POS on multiple devices
2. Deactivate store
3. Verify all devices show blocker simultaneously

### 4. Offline Mode

1. Device goes offline
2. Store status changes while offline
3. Device comes back online
4. Verify status updates correctly

## Future Enhancements

- Add sound notification when store is deactivated
- Support for scheduled deactivation
- Configurable warning messages per tenant
- Partial operation restrictions (allow certain actions)
- Admin override capability for emergency situations
