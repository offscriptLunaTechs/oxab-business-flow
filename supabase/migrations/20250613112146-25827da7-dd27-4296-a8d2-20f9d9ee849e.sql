
-- Update the dashboard stats function to calculate monthly revenue more accurately
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
            -- Calculate revenue based on actual payments received this month
            -- This represents real cash flow and avoids duplications
            SELECT COALESCE(SUM(cp.amount), 0)
            FROM customer_payments cp
            WHERE cp.payment_date >= month_start
              AND cp.payment_date < (month_start + interval '1 month')::date
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
