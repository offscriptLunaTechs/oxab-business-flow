
-- Enhance the dashboard stats function to calculate real trends and changes
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    result json;
    today_start date := CURRENT_DATE;
    yesterday_start date := CURRENT_DATE - 1;
    month_start date := date_trunc('month', CURRENT_DATE)::date;
    last_month_start date := (date_trunc('month', CURRENT_DATE) - interval '1 month')::date;
    last_month_end date := (date_trunc('month', CURRENT_DATE) - interval '1 day')::date;
    
    today_invoices_count integer;
    yesterday_invoices_count integer;
    current_month_revenue numeric;
    last_month_revenue numeric;
    revenue_change_percent numeric;
    invoice_change_text text;
BEGIN
    -- Get today's invoice count
    SELECT COUNT(*) INTO today_invoices_count
    FROM invoices 
    WHERE date = today_start;
    
    -- Get yesterday's invoice count
    SELECT COUNT(*) INTO yesterday_invoices_count
    FROM invoices 
    WHERE date = yesterday_start;
    
    -- Calculate current month revenue (payments received this month)
    SELECT COALESCE(SUM(cp.amount), 0) INTO current_month_revenue
    FROM customer_payments cp
    WHERE cp.payment_date >= month_start
      AND cp.payment_date < (month_start + interval '1 month')::date;
    
    -- Calculate last month revenue
    SELECT COALESCE(SUM(cp.amount), 0) INTO last_month_revenue
    FROM customer_payments cp
    WHERE cp.payment_date >= last_month_start
      AND cp.payment_date <= last_month_end;
    
    -- Calculate revenue percentage change
    IF last_month_revenue > 0 THEN
        revenue_change_percent := ROUND(((current_month_revenue - last_month_revenue) / last_month_revenue * 100)::numeric, 1);
    ELSE
        revenue_change_percent := NULL;
    END IF;
    
    -- Generate invoice change text
    IF yesterday_invoices_count = 0 AND today_invoices_count = 0 THEN
        invoice_change_text := 'No invoices yesterday or today';
    ELSIF yesterday_invoices_count = 0 THEN
        invoice_change_text := 'First invoices today';
    ELSE
        invoice_change_text := CASE 
            WHEN today_invoices_count > yesterday_invoices_count THEN 
                '+' || (today_invoices_count - yesterday_invoices_count)::text || ' from yesterday'
            WHEN today_invoices_count < yesterday_invoices_count THEN
                '-' || (yesterday_invoices_count - today_invoices_count)::text || ' from yesterday'
            ELSE
                'Same as yesterday'
        END;
    END IF;

    SELECT json_build_object(
        'todayInvoices', today_invoices_count,
        'todayInvoicesChange', invoice_change_text,
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
        'monthlyRevenue', current_month_revenue,
        'monthlyRevenueChange', CASE 
            WHEN revenue_change_percent IS NULL THEN 'No previous month data'
            WHEN revenue_change_percent >= 0 THEN '+' || revenue_change_percent || '% from last month'
            ELSE revenue_change_percent || '% from last month'
        END,
        'monthlyRevenueChangeType', CASE 
            WHEN revenue_change_percent IS NULL THEN 'neutral'
            WHEN revenue_change_percent >= 0 THEN 'positive'
            ELSE 'negative'
        END,
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
