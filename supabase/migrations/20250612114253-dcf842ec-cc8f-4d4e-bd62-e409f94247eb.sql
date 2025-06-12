
-- Create comprehensive outstanding invoices report function
CREATE OR REPLACE FUNCTION public.get_outstanding_invoices_report(
  p_customer_id uuid DEFAULT NULL,
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL,
  p_min_amount numeric DEFAULT NULL
) RETURNS TABLE(
  invoice_id text,
  customer_id uuid,
  customer_name text,
  customer_code text,
  customer_type text,
  invoice_date date,
  due_date date,
  total_amount numeric,
  paid_amount numeric,
  outstanding_amount numeric,
  days_overdue integer,
  aging_bucket text,
  status text,
  payment_status text
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id as invoice_id,
    i.customer_id,
    c.name as customer_name,
    c.code as customer_code,
    c.customer_type,
    i.date as invoice_date,
    i.due_date,
    i.total as total_amount,
    COALESCE(SUM(ip.allocated_amount), 0) as paid_amount,
    (i.total - COALESCE(SUM(ip.allocated_amount), 0)) as outstanding_amount,
    CASE 
      WHEN i.due_date >= CURRENT_DATE THEN 0
      ELSE EXTRACT(days FROM CURRENT_DATE - i.due_date)::integer
    END as days_overdue,
    CASE 
      WHEN i.due_date >= CURRENT_DATE THEN 'Current'
      WHEN EXTRACT(days FROM CURRENT_DATE - i.due_date) <= 30 THEN '1-30 Days'
      WHEN EXTRACT(days FROM CURRENT_DATE - i.due_date) <= 60 THEN '31-60 Days'
      WHEN EXTRACT(days FROM CURRENT_DATE - i.due_date) <= 90 THEN '61-90 Days'
      ELSE '90+ Days'
    END as aging_bucket,
    i.status,
    CASE 
      WHEN COALESCE(SUM(ip.allocated_amount), 0) = 0 THEN 
        CASE WHEN i.due_date < CURRENT_DATE THEN 'overdue' ELSE 'pending' END
      WHEN COALESCE(SUM(ip.allocated_amount), 0) >= i.total THEN 'paid'
      ELSE 'partially_paid'
    END as payment_status
  FROM invoices i
  INNER JOIN customers c ON i.customer_id = c.id
  LEFT JOIN invoice_payments ip ON i.id = ip.invoice_id
  WHERE (i.status IN ('pending', 'overdue') OR COALESCE(SUM(ip.allocated_amount), 0) < i.total)
    AND (p_customer_id IS NULL OR i.customer_id = p_customer_id)
    AND (p_start_date IS NULL OR i.date >= p_start_date)
    AND (p_end_date IS NULL OR i.date <= p_end_date)
  GROUP BY i.id, i.customer_id, c.name, c.code, c.customer_type, i.date, i.due_date, i.total, i.status
  HAVING (i.total - COALESCE(SUM(ip.allocated_amount), 0)) > 0
    AND (p_min_amount IS NULL OR (i.total - COALESCE(SUM(ip.allocated_amount), 0)) >= p_min_amount)
  ORDER BY i.due_date ASC, (i.total - COALESCE(SUM(ip.allocated_amount), 0)) DESC;
END;
$$;

-- Update dashboard stats function to use accurate payment data
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
            SELECT COALESCE(SUM(cp.amount), 0)
            FROM customer_payments cp
            WHERE cp.payment_date >= month_start
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer_status ON invoices(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_date ON customer_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_customer_payments_customer_id ON customer_payments(customer_id);
