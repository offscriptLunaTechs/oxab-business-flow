
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, InventoryItem } from '@/types/invoice';

export interface ProductWithInventory extends Product {
  inventory: InventoryItem | null;
  stock_level?: number;
  is_low_stock?: boolean;
}

export const useProducts = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['products', searchTerm],
    queryFn: async (): Promise<ProductWithInventory[]> => {
      let query = supabase
        .from('products')
        .select(`
          *,
          inventory!inventory_product_id_fkey(*)
        `)
        .order('name');
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data?.map(product => ({
        ...product,
        inventory: product.inventory?.[0] || null,
        stock_level: product.inventory?.[0]?.quantity || 0,
        is_low_stock: (product.inventory?.[0]?.quantity || 0) <= (product.inventory?.[0]?.reorder_level || 10)
      })) || [];
    },
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async (): Promise<ProductWithInventory> => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          inventory!inventory_product_id_fkey(*)
        `)
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        inventory: data.inventory?.[0] || null,
        stock_level: data.inventory?.[0]?.quantity || 0,
        is_low_stock: (data.inventory?.[0]?.quantity || 0) <= (data.inventory?.[0]?.reorder_level || 10)
      };
    },
    enabled: !!productId,
  });
};
