CREATE OR REPLACE FUNCTION delete_pending_category_after_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new category has a localId
  IF NEW."localId" IS NOT NULL THEN
    -- Delete any pending categories with the same localId
    DELETE FROM pending_categories 
    WHERE "localId" = NEW."localId";
  END IF;
  
  -- Return the new row (this is required for AFTER triggers)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Create the trigger
CREATE TRIGGER delete_pending_category_trigger
AFTER INSERT ON categories
FOR EACH ROW
EXECUTE FUNCTION delete_pending_category_after_insert();
