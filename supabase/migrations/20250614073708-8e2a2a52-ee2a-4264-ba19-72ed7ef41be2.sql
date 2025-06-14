
-- Create function to get monthly inventory movements
CREATE OR REPLACE FUNCTION public.get_monthly_inventory_movements(p_months integer DEFAULT 6)
RETURNS TABLE(
    month text,
    inbound integer,
    outbound integer,
    variance integer
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH monthly_stats AS (
        SELECT 
            TO_CHAR(DATE_TRUNC('month', sm.created_at), 'Mon') as month_name,
            DATE_TRUNC('month', sm.created_at) as month_date,
            SUM(CASE WHEN sm.movement_type = 'in' THEN sm.quantity ELSE 0 END) as total_inbound,
            SUM(CASE WHEN sm.movement_type = 'out' THEN sm.quantity ELSE 0 END) as total_outbound
        FROM stock_movements sm
        WHERE sm.created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' * (p_months - 1)
        GROUP BY DATE_TRUNC('month', sm.created_at)
        ORDER BY month_date DESC
    )
    SELECT 
        ms.month_name,
        ms.total_inbound::integer,
        ms.total_outbound::integer,
        (ms.total_inbound - ms.total_outbound)::integer as variance
    FROM monthly_stats ms;
END;
$function$;

-- Create function to get top moving products
CREATE OR REPLACE FUNCTION public.get_top_moving_products(p_limit integer DEFAULT 10, p_days integer DEFAULT 30)
RETURNS TABLE(
    product_name text,
    sku text,
    total_moved integer,
    movement_type text,
    percentage numeric
)
LANGUAGE plpgsql
AS $function$
DECLARE
    total_movements integer;
BEGIN
    -- Get total movements for percentage calculation
    SELECT SUM(sm.quantity) INTO total_movements
    FROM stock_movements sm
    WHERE sm.created_at >= CURRENT_DATE - INTERVAL '1 day' * p_days
    AND sm.movement_type = 'out';
    
    -- Return top movers
    RETURN QUERY
    SELECT 
        p.name,
        p.sku,
        SUM(sm.quantity)::integer as moved,
        'out'::text as type,
        CASE 
            WHEN total_movements > 0 THEN ROUND((SUM(sm.quantity)::numeric / total_movements::numeric) * 100, 0)
            ELSE 0::numeric
        END as percentage
    FROM stock_movements sm
    JOIN products p ON sm.product_id = p.id
    WHERE sm.created_at >= CURRENT_DATE - INTERVAL '1 day' * p_days
    AND sm.movement_type = 'out'
    GROUP BY p.id, p.name, p.sku
    ORDER BY moved DESC
    LIMIT p_limit;
END;
$function$;

-- Create function to get inventory variance analysis
CREATE OR REPLACE FUNCTION public.get_inventory_variance_summary(p_months integer DEFAULT 6)
RETURNS TABLE(
    positive_variance numeric,
    negative_variance numeric,
    net_variance numeric
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH variance_data AS (
        SELECT 
            SUM(CASE WHEN sm.movement_type = 'in' THEN sm.quantity ELSE 0 END) as total_inbound,
            SUM(CASE WHEN sm.movement_type = 'out' THEN sm.quantity ELSE 0 END) as total_outbound
        FROM stock_movements sm
        WHERE sm.created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' * (p_months - 1)
    )
    SELECT 
        vd.total_inbound::numeric as positive_variance,
        (-1 * vd.total_outbound)::numeric as negative_variance,
        (vd.total_inbound - vd.total_outbound)::numeric as net_variance
    FROM variance_data vd;
END;
$function$;
