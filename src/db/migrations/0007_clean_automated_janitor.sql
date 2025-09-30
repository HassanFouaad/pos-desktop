CREATE OR REPLACE FUNCTION delete_pending_customer_after_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new customer has a localId
  IF NEW."localId" IS NOT NULL THEN
    -- Delete any pending customers with the same localId
    DELETE FROM pending_customers 
    WHERE "localId" = NEW."localId";
  END IF;
  
  -- Return the new row (this is required for AFTER triggers)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Create the trigger
CREATE TRIGGER delete_pending_customer_trigger
AFTER INSERT ON customers
FOR EACH ROW
EXECUTE FUNCTION delete_pending_customer_after_insert();
