
-- Fix the EXTRACT function issue by using direct date subtraction
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
  WITH invoice_payments_summary AS (
    SELECT 
      ip.invoice_id,
      COALESCE(SUM(ip.allocated_amount), 0) as total_paid
    FROM invoice_payments ip
    GROUP BY ip.invoice_id
  ),
  invoice_details AS (
    SELECT 
      i.id as invoice_id,
      i.customer_id,
      c.name as customer_name,
      c.code as customer_code,
      c.customer_type,
      i.date as invoice_date,
      i.due_date,
      i.total as total_amount,
      COALESCE(ips.total_paid, 0) as paid_amount,
      (i.total - COALESCE(ips.total_paid, 0)) as outstanding_amount,
      CASE 
        WHEN i.due_date >= CURRENT_DATE THEN 0
        ELSE (CURRENT_DATE - i.due_date)::integer
      END as days_overdue,
      CASE 
        WHEN i.due_date >= CURRENT_DATE THEN 'Current'
        WHEN (CURRENT_DATE - i.due_date)::integer <= 30 THEN '1-30 Days'
        WHEN (CURRENT_DATE - i.due_date)::integer <= 60 THEN '31-60 Days'
        WHEN (CURRENT_DATE - i.due_date)::integer <= 90 THEN '61-90 Days'
        ELSE '90+ Days'
      END as aging_bucket,
      i.status,
      CASE 
        WHEN COALESCE(ips.total_paid, 0) = 0 THEN 
          CASE WHEN i.due_date < CURRENT_DATE THEN 'overdue' ELSE 'pending' END
        WHEN COALESCE(ips.total_paid, 0) >= i.total THEN 'paid'
        ELSE 'partially_paid'
      END as payment_status
    FROM invoices i
    INNER JOIN customers c ON i.customer_id = c.id
    LEFT JOIN invoice_payments_summary ips ON i.id = ips.invoice_id
  )
  SELECT 
    id.invoice_id,
    id.customer_id,
    id.customer_name,
    id.customer_code,
    id.customer_type,
    id.invoice_date,
    id.due_date,
    id.total_amount,
    id.paid_amount,
    id.outstanding_amount,
    id.days_overdue,
    id.aging_bucket,
    id.status,
    id.payment_status
  FROM invoice_details id
  WHERE id.outstanding_amount > 0
    AND (p_customer_id IS NULL OR id.customer_id = p_customer_id)
    AND (p_start_date IS NULL OR id.invoice_date >= p_start_date)
    AND (p_end_date IS NULL OR id.invoice_date <= p_end_date)
    AND (p_min_amount IS NULL OR id.outstanding_amount >= p_min_amount)
  ORDER BY id.due_date ASC, id.outstanding_amount DESC;
END;
$$;
