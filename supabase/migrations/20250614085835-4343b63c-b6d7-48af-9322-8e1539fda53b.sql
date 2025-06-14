
-- Add status column to products table
ALTER TABLE public.products 
ADD COLUMN status text NOT NULL DEFAULT 'active';

-- Add check constraint to ensure valid status values
ALTER TABLE public.products 
ADD CONSTRAINT products_status_check 
CHECK (status IN ('active', 'discontinued', 'inactive'));

-- Create index for better performance when filtering by status
CREATE INDEX idx_products_status ON public.products(status);

-- Update any existing products with 0 stock to discontinued status if needed
-- (This is optional - you can manually set specific products to discontinued later)
-- UPDATE public.products SET status = 'discontinued' WHERE id IN (
--   SELECT p.id FROM products p 
--   LEFT JOIN inventory i ON p.id = i.product_id 
--   WHERE COALESCE(i.quantity, 0) = 0
-- );
