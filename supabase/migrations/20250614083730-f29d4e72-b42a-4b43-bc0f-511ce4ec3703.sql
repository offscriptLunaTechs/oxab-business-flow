
-- First, let's identify and clean up duplicate inventory records
-- Keep the most recent record for each product_id and remove duplicates
WITH duplicate_inventory AS (
  SELECT 
    product_id,
    array_agg(id ORDER BY last_updated DESC, created_at DESC) as inventory_ids
  FROM inventory
  GROUP BY product_id
  HAVING COUNT(*) > 1
),
records_to_keep AS (
  SELECT 
    product_id,
    inventory_ids[1] as keep_id
  FROM duplicate_inventory
),
records_to_delete AS (
  SELECT 
    unnest(inventory_ids[2:]) as delete_id
  FROM duplicate_inventory
)
DELETE FROM inventory 
WHERE id IN (SELECT delete_id FROM records_to_delete);

-- Add unique constraint to prevent future duplicates
ALTER TABLE inventory 
ADD CONSTRAINT inventory_product_id_unique UNIQUE (product_id);

-- Create an index for better performance on product_id lookups
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);

-- Update the inventory trigger function to handle upserts properly
CREATE OR REPLACE FUNCTION public.update_inventory_on_invoice_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    movement_type text;
    prev_qty integer;
    new_qty integer;
BEGIN
    -- Validate input
    IF NEW.product_id IS NULL OR NEW.quantity IS NULL OR NEW.quantity < 0 THEN
        RAISE EXCEPTION 'Invalid invoice item data';
    END IF;
    
    -- Determine if it's a new invoice item
    IF TG_OP = 'INSERT' THEN
        -- Get current inventory using upsert to handle missing records
        INSERT INTO public.inventory (product_id, quantity, reorder_level)
        VALUES (NEW.product_id, 0, 10)
        ON CONFLICT (product_id) DO NOTHING;
        
        SELECT quantity INTO prev_qty FROM public.inventory WHERE product_id = NEW.product_id;
        
        -- Update inventory - reduce by the quantity in the invoice item
        new_qty := prev_qty - NEW.quantity;
        UPDATE public.inventory 
        SET quantity = new_qty, last_updated = now() 
        WHERE product_id = NEW.product_id;
        
        -- Record stock movement
        INSERT INTO public.stock_movements (
            product_id, 
            invoice_id, 
            movement_type, 
            quantity, 
            previous_stock, 
            new_stock,
            reason
        )
        VALUES (
            NEW.product_id, 
            NEW.invoice_id, 
            'out', 
            NEW.quantity, 
            prev_qty, 
            new_qty,
            'Invoice item created'
        );
        
    -- Handle updates to invoice items
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only process if quantity changed
        IF NEW.quantity <> OLD.quantity THEN
            -- Get current inventory
            SELECT quantity INTO prev_qty FROM public.inventory WHERE product_id = NEW.product_id;
            
            -- Calculate new inventory
            new_qty := prev_qty + OLD.quantity - NEW.quantity;
            
            -- Update inventory
            UPDATE public.inventory 
            SET quantity = new_qty, last_updated = now() 
            WHERE product_id = NEW.product_id;
            
            -- Record stock movement
            INSERT INTO public.stock_movements (
                product_id, 
                invoice_id, 
                movement_type, 
                quantity, 
                previous_stock, 
                new_stock,
                reason
            )
            VALUES (
                NEW.product_id, 
                NEW.invoice_id, 
                'adjustment', 
                (NEW.quantity - OLD.quantity), 
                prev_qty, 
                new_qty,
                'Invoice item updated'
            );
        END IF;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error updating inventory: %', SQLERRM;
END;
$function$;
