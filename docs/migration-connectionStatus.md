# Connection Status Migration Guide

## Overview

This document provides guidance for migrating existing POS devices to support the new `connectionStatus` field in the `posDevices` table.

## Schema Change

The `posDevices` table has been updated to include a new `connectionStatus` field:

```typescript
connectionStatus: text("connectionStatus")
  .$type<ConnectionStatus>()
  .default("offline");
```

## Migration Strategy

### Option 1: Automatic Schema Update (Recommended)

Drizzle ORM will automatically handle the schema migration when the application starts. The new field will be added with the default value of `"offline"`.

**Steps:**

1. Update the application to the latest version
2. Start the application
3. Drizzle will detect the schema change and update the database
4. The `connectionStatus` field will be added with default value `"offline"`

### Option 2: Manual Migration Script

If you need to manually migrate the database, you can use the following SQL:

```sql
-- Add connectionStatus column with default value
ALTER TABLE pos_devices ADD COLUMN connectionStatus TEXT DEFAULT 'offline';
```

## Verification

To verify the migration was successful:

1. Start the application
2. Check the database schema:
   ```typescript
   // In the browser console or Tauri console
   const db = await getDb();
   const result = await db.select().from(posDevices).limit(1);
   console.log(result);
   ```
3. Verify the `connectionStatus` field exists and has a value

## Rollback

If you need to rollback the migration:

```sql
-- Remove connectionStatus column
ALTER TABLE pos_devices DROP COLUMN connectionStatus;
```

**Note:** This will remove all connection status data. Make sure to backup your database before performing a rollback.

## Impact

- **Existing Devices**: Will start with `connectionStatus = "offline"` after migration
- **New Devices**: Will have `connectionStatus = "offline"` by default
- **No Data Loss**: No existing data will be affected by this migration

## Testing

After migration, test the following:

1. **Connection Status Updates**:

   - Start the application (status should be "offline")
   - Trigger a sync (status should change to "syncing" then "online")
   - Disconnect network (status should change to "offline")

2. **Persistence**:

   - Set status to "online"
   - Restart the application
   - Verify status is preserved

3. **Redux Integration**:
   - Open the Settings page
   - Verify ConnectionStatusCard shows correct status
   - Trigger status changes and verify UI updates

## Troubleshooting

### Issue: connectionStatus field is null

**Solution**: Ensure the default value is set in the schema:

```typescript
.default("offline")
```

### Issue: Application crashes after migration

**Solution**:

1. Check Drizzle ORM version is up to date
2. Verify schema definition is correct
3. Clear the database and re-pair the device (last resort)

### Issue: Status doesn't update

**Solution**:

1. Verify `BackendConnector` is calling `updateConnectionStatus()`
2. Check Redux actions are dispatched
3. Verify `posDeviceRepository` methods are working

## Support

For additional support, refer to:

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [SQLite ALTER TABLE Documentation](https://www.sqlite.org/lang_altertable.html)
