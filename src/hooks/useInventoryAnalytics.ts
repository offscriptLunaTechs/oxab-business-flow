
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
      
      const { data, error } = await supabase.rpc('get_top_moving_products', {
        p_limit: limit,
        p_days: days
      });

      if (error) {
        console.error('Top moving products error:', error);
        throw new Error(`Failed to fetch top moving products: ${error.message}`);
      }

      console.log('Top moving products loaded:', data?.length || 0, 'records');
      return data || [];
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
