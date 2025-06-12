
-- Migration to sync legacy paid invoices with payment records
-- Step 1: Create payment records for legacy paid invoices
INSERT INTO public.customer_payments (
  customer_id,
  amount,
  payment_date,
  payment_method,
  reference_number,
  notes,
  created_at
)
SELECT DISTINCT
  i.customer_id,
  i.total,
  i.date, -- Use invoice date as payment date
  'cash'::text, -- Assign cash payment method
  'LEGACY-' || i.id, -- Reference to original invoice
  'Auto-migrated payment for legacy paid invoice',
  i.created_at
FROM public.invoices i
WHERE i.status = 'paid'
  AND NOT EXISTS (
    SELECT 1 FROM public.invoice_payments ip WHERE ip.invoice_id = i.id
  );

-- Step 2: Create invoice payment allocations for the newly created payments
INSERT INTO public.invoice_payments (
  payment_id,
  invoice_id,
  allocated_amount
)
SELECT 
  cp.id,
  i.id,
  i.total
FROM public.invoices i
JOIN public.customer_payments cp ON (
  cp.customer_id = i.customer_id 
  AND cp.amount = i.total 
  AND cp.payment_date = i.date
  AND cp.reference_number = 'LEGACY-' || i.id
)
WHERE i.status = 'paid'
  AND NOT EXISTS (
    SELECT 1 FROM public.invoice_payments ip WHERE ip.invoice_id = i.id
  );

-- Step 3: Update dashboard stats function to include both payment records and legacy paid invoices
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    result json;
    today_start date := CURRENT_DATE;
    month_start date := date_trunc('month', CURRENT_DATE)::date;
BEGIN
    SELECT json_build_object(
        'todayInvoices', (
            SELECT COUNT(*) 
            FROM invoices 
            WHERE date = today_start
        ),
        'pendingInvoices', (
            SELECT COUNT(*)
            FROM (
                SELECT i.id
                FROM invoices i
                LEFT JOIN invoice_payments ip ON i.id = ip.invoice_id
                WHERE i.status IN ('pending', 'overdue')
                GROUP BY i.id, i.total
                HAVING (i.total - COALESCE(SUM(ip.allocated_amount), 0)) > 0
            ) pending_invoices
        ),
        'overdueInvoices', (
            SELECT COUNT(*)
            FROM (
                SELECT i.id
                FROM invoices i
                LEFT JOIN invoice_payments ip ON i.id = ip.invoice_id
                WHERE i.due_date < CURRENT_DATE
                GROUP BY i.id, i.total, i.due_date
                HAVING (i.total - COALESCE(SUM(ip.allocated_amount), 0)) > 0
            ) overdue_invoices
        ),
        'monthlyRevenue', (
            -- Combined revenue from actual payments AND legacy paid invoices
            SELECT COALESCE(
                (SELECT SUM(cp.amount) FROM customer_payments cp WHERE cp.payment_date >= month_start) +
                (SELECT SUM(i.total) FROM invoices i 
                 WHERE i.date >= month_start 
                   AND i.status = 'paid' 
                   AND NOT EXISTS (SELECT 1 FROM invoice_payments ip WHERE ip.invoice_id = i.id)),
                0
            )
        ),
        'totalOutstanding', (
            SELECT COALESCE(SUM(i.total - COALESCE(payment_totals.paid_amount, 0)), 0)
            FROM invoices i
            LEFT JOIN (
                SELECT ip.invoice_id, SUM(ip.allocated_amount) as paid_amount
                FROM invoice_payments ip
                GROUP BY ip.invoice_id
            ) payment_totals ON i.id = payment_totals.invoice_id
            WHERE i.status IN ('pending', 'overdue')
            AND (i.total - COALESCE(payment_totals.paid_amount, 0)) > 0
        ),
        'lowStockCount', (
            SELECT COUNT(*) 
            FROM inventory i 
            WHERE i.quantity <= i.reorder_level
        ),
        'topCustomers', (
            SELECT COALESCE(json_agg(customer_data), '[]'::json)
            FROM (
                SELECT 
                    c.name,
                    SUM(cp.amount) as total_spent
                FROM customers c
                JOIN customer_payments cp ON c.id = cp.customer_id
                WHERE cp.payment_date >= month_start
                GROUP BY c.id, c.name
                ORDER BY total_spent DESC
                LIMIT 5
            ) customer_data
        ),
        'recentActivity', (
            SELECT COALESCE(json_agg(activity_data), '[]'::json)
            FROM (
                SELECT 
                    'payment' as type,
                    cp.id,
                    CONCAT('Payment from ', c.name) as description,
                    cp.amount,
                    cp.payment_date as timestamp
                FROM customer_payments cp
                JOIN customers c ON cp.customer_id = c.id
                ORDER BY cp.payment_date DESC, cp.created_at DESC
                LIMIT 10
            ) activity_data
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Step 4: Add safeguard trigger to prevent future inconsistencies
CREATE OR REPLACE FUNCTION public.ensure_paid_invoice_has_payment()
RETURNS trigger AS $$
BEGIN
  -- If invoice status is being changed to 'paid', ensure there's a payment record
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    -- Check if payment allocation exists
    IF NOT EXISTS (
      SELECT 1 FROM public.invoice_payments ip WHERE ip.invoice_id = NEW.id
    ) THEN
      -- Log a warning - in production you might want to create an automatic payment
      RAISE WARNING 'Invoice % marked as paid but no payment allocation exists', NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS check_paid_invoice_payment ON public.invoices;
CREATE TRIGGER check_paid_invoice_payment
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_paid_invoice_has_payment();
