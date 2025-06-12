
-- Phase 1: Complete Data Cleanup and Reversal

-- Step 1: Delete all legacy payment allocations
DELETE FROM invoice_payments 
WHERE payment_id IN (
  SELECT id FROM customer_payments 
  WHERE reference_number LIKE 'LEGACY-%'
);

-- Step 2: Delete all legacy payment records
DELETE FROM customer_payments 
WHERE reference_number LIKE 'LEGACY-%';

-- Step 3: Revert invoice statuses that were incorrectly updated during migration
-- We'll revert invoices that were updated to 'paid' status recently (last 7 days)
-- and don't have any legitimate payment allocations
UPDATE invoices 
SET status = 'pending', updated_at = now()
WHERE status = 'paid' 
  AND updated_at > (now() - interval '7 days')
  AND NOT EXISTS (
    SELECT 1 FROM invoice_payments ip 
    WHERE ip.invoice_id = invoices.id
  );

-- Step 4: Enhanced migration - only migrate invoices with 'paid' status that don't have payment records
-- Create payment records for legitimately paid invoices without payment allocations
INSERT INTO customer_payments (
  customer_id,
  amount,
  payment_date,
  payment_method,
  reference_number,
  notes
)
SELECT DISTINCT
  i.customer_id,
  i.total,
  i.date,
  'cash',
  'LEGACY-' || i.id,
  'Legacy payment migration for paid invoice'
FROM invoices i
WHERE i.status = 'paid'
  AND NOT EXISTS (
    SELECT 1 FROM invoice_payments ip WHERE ip.invoice_id = i.id
  )
  AND i.created_at < '2025-01-01'  -- Only migrate truly legacy invoices
  AND i.total > 0;

-- Step 5: Create payment allocations for the legacy payments we just created
INSERT INTO invoice_payments (
  payment_id,
  invoice_id,
  allocated_amount
)
SELECT 
  cp.id,
  i.id,
  i.total
FROM customer_payments cp
JOIN invoices i ON i.customer_id = cp.customer_id 
  AND cp.reference_number = 'LEGACY-' || i.id
WHERE cp.reference_number LIKE 'LEGACY-%'
  AND i.status = 'paid'
  AND NOT EXISTS (
    SELECT 1 FROM invoice_payments ip WHERE ip.invoice_id = i.id
  );
