-- Solution: BEFORE INSERT trigger that updates existing record instead of inserting
CREATE OR REPLACE FUNCTION handle_sync_insert_customers()
RETURNS TRIGGER AS $$
DECLARE
    record_exists BOOLEAN;
BEGIN
    -- Check if a record with this ID already exists
    SELECT EXISTS(
        SELECT 1 FROM customers WHERE id = NEW.id
    ) INTO record_exists;
    
    -- If record exists, update it to synced status and cancel the insert
    IF record_exists THEN
        UPDATE customers
        SET "syncStatus" = 'success'
        WHERE id = NEW.id;
        
        -- Return NULL to cancel the insert operation
        RETURN NULL;
    END IF;
    
    -- If record doesn't exist, allow the insert to proceed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Create the trigger
DROP TRIGGER IF EXISTS sync_upsert_trigger_customers ON customers;--> statement-breakpoint

CREATE TRIGGER sync_upsert_trigger_customers
    BEFORE INSERT ON customers
    FOR EACH ROW
    EXECUTE FUNCTION handle_sync_insert_customers();