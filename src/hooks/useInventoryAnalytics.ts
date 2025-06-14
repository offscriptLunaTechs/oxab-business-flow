import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyMovement {
  month: string;
  inbound: number;
  outbound: number;
  variance: number;
}

export interface TopMovingProduct {
  product_name: string;
  sku: string;
  size: string;
  total_moved: number;
  movement_type: string;
  percentage: number;
}

export interface VarianceSummary {
  positive_variance: number;
  negative_variance: number;
  net_variance: number;
}

export const useMonthlyMovements = (months: number = 6) => {
  return useQuery({
    queryKey: ['monthly-movements', months],
    queryFn: async (): Promise<MonthlyMovement[]> => {
      console.log('Fetching monthly movements...');
      
      const { data, error } = await supabase.rpc('get_monthly_inventory_movements', {
        p_months: months
      });

      if (error) {
        console.error('Monthly movements error:', error);
        throw new Error(`Failed to fetch monthly movements: ${error.message}`);
      }

      console.log('Monthly movements loaded:', data?.length || 0, 'records');
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTopMovingProducts = (limit: number = 10, days: number = 30) => {
  return useQuery({
    queryKey: ['top-moving-products', limit, days],
    queryFn: async (): Promise<TopMovingProduct[]> => {
      console.log('Fetching top moving products...');
      
      // Use a custom query to get product details including size
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          quantity,
          movement_type,
          products!inner(
            name,
            sku,
            size
          )
        `)
        .eq('movement_type', 'out')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Top moving products error:', error);
        throw new Error(`Failed to fetch top moving products: ${error.message}`);
      }

      // Group by product and calculate totals
      const productMovements = new Map<string, {
        product_name: string;
        sku: string;
        size: string;
        total_moved: number;
      }>();

      let totalQuantity = 0;

      data?.forEach(movement => {
        const key = `${movement.products.sku}-${movement.products.size}`;
        const existing = productMovements.get(key);
        
        if (existing) {
          existing.total_moved += movement.quantity;
        } else {
          productMovements.set(key, {
            product_name: movement.products.name,
            sku: movement.products.sku,
            size: movement.products.size,
            total_moved: movement.quantity
          });
        }
        
        totalQuantity += movement.quantity;
      });

      // Convert to array and sort by total moved
      const sortedProducts = Array.from(productMovements.values())
        .sort((a, b) => b.total_moved - a.total_moved)
        .slice(0, limit)
        .map(product => ({
          ...product,
          movement_type: 'out' as const,
          percentage: totalQuantity > 0 ? Math.round((product.total_moved / totalQuantity) * 100) : 0
        }));

      console.log('Top moving products loaded:', sortedProducts.length, 'records');
      return sortedProducts;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useVarianceSummary = (months: number = 6) => {
  return useQuery({
    queryKey: ['variance-summary', months],
    queryFn: async (): Promise<VarianceSummary | null> => {
      console.log('Fetching variance summary...');
      
      const { data, error } = await supabase.rpc('get_inventory_variance_summary', {
        p_months: months
      });

      if (error) {
        console.error('Variance summary error:', error);
        throw new Error(`Failed to fetch variance summary: ${error.message}`);
      }

      console.log('Variance summary loaded:', data);
      return data?.[0] || null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
