
-- Create function to get per-SKU monthly movements
CREATE OR REPLACE FUNCTION public.get_sku_monthly_movements(p_months integer DEFAULT 6)
RETURNS TABLE(
    sku text,
    product_name text,
    size text,
    month text,
    net_movement integer,
    inbound integer,
    outbound integer
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH monthly_sku_stats AS (
        SELECT 
            p.sku,
            p.name as product_name,
            p.size,
            TO_CHAR(DATE_TRUNC('month', sm.created_at), 'Mon YYYY') as month_name,
            DATE_TRUNC('month', sm.created_at) as month_date,
            SUM(CASE WHEN sm.movement_type = 'in' THEN sm.quantity ELSE 0 END) as total_inbound,
            SUM(CASE WHEN sm.movement_type = 'out' THEN sm.quantity ELSE 0 END) as total_outbound
        FROM stock_movements sm
        JOIN products p ON sm.product_id = p.id
        WHERE sm.created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' * (p_months - 1)
        GROUP BY p.sku, p.name, p.size, DATE_TRUNC('month', sm.created_at)
        ORDER BY month_date DESC, p.sku
    )
    SELECT 
        mss.sku,
        mss.product_name,
        mss.size,
        mss.month_name,
        (mss.total_inbound - mss.total_outbound)::integer as net_movement,
        mss.total_inbound::integer,
        mss.total_outbound::integer
    FROM monthly_sku_stats mss;
END;
$function$;

-- Create function to get current stock levels per SKU
CREATE OR REPLACE FUNCTION public.get_sku_stock_levels()
RETURNS TABLE(
    sku text,
    product_name text,
    size text,
    current_stock integer,
    stock_value numeric
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        p.sku,
        p.name as product_name,
        p.size,
        COALESCE(i.quantity, 0)::integer as current_stock,
        (COALESCE(i.quantity, 0) * p.base_price)::numeric as stock_value
    FROM products p
    LEFT JOIN inventory i ON p.id = i.product_id
    WHERE COALESCE(i.quantity, 0) > 0
    ORDER BY current_stock DESC, p.sku;
END;
$function$;
