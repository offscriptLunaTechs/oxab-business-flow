
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason?: string;
  invoice_id?: string;
  performed_by?: string;
  created_at: string;
  product?: {
    name: string;
    sku: string;
  };
}

export const useStockMovements = (limit: number = 50) => {
  return useQuery({
    queryKey: ['stock-movements', limit],
    queryFn: async (): Promise<StockMovement[]> => {
      console.log('Fetching stock movements...');
      
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products (
            name,
            sku
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Stock movements error:', error);
        throw new Error(`Failed to fetch stock movements: ${error.message}`);
      }

      console.log('Stock movements loaded:', data?.length || 0, 'records');
      return data?.map(movement => ({
        ...movement,
        movement_type: movement.movement_type as 'in' | 'out' | 'adjustment',
        product: movement.products
      })) || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

export const useProductStockMovements = (productId: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['product-stock-movements', productId, limit],
    queryFn: async (): Promise<StockMovement[]> => {
      if (!productId) return [];
      
      console.log('Fetching stock movements for product:', productId);
      
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products (
            name,
            sku
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Product stock movements error:', error);
        throw new Error(`Failed to fetch product stock movements: ${error.message}`);
      }

      console.log('Product stock movements loaded:', data?.length || 0, 'records');
      return data?.map(movement => ({
        ...movement,
        movement_type: movement.movement_type as 'in' | 'out' | 'adjustment',
        product: movement.products
      })) || [];
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};
