
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SkuMonthlyMovement {
  sku: string;
  product_name: string;
  size: string;
  month: string;
  net_movement: number;
  inbound: number;
  outbound: number;
}

export interface SkuStockLevel {
  sku: string;
  product_name: string;
  size: string;
  current_stock: number;
  stock_value: number;
}

export const useSkuMonthlyMovements = (months: number = 6) => {
  return useQuery({
    queryKey: ['sku-monthly-movements', months],
    queryFn: async (): Promise<SkuMonthlyMovement[]> => {
      console.log('Fetching SKU monthly movements...');
      
      const { data, error } = await supabase.rpc('get_sku_monthly_movements', {
        p_months: months
      });

      if (error) {
        console.error('SKU monthly movements error:', error);
        throw new Error(`Failed to fetch SKU monthly movements: ${error.message}`);
      }

      console.log('SKU monthly movements loaded:', data?.length || 0, 'records');
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSkuStockLevels = () => {
  return useQuery({
    queryKey: ['sku-stock-levels'],
    queryFn: async (): Promise<SkuStockLevel[]> => {
      console.log('Fetching SKU stock levels...');
      
      const { data, error } = await supabase.rpc('get_sku_stock_levels');

      if (error) {
        console.error('SKU stock levels error:', error);
        throw new Error(`Failed to fetch SKU stock levels: ${error.message}`);
      }

      console.log('SKU stock levels loaded:', data?.length || 0, 'records');
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
