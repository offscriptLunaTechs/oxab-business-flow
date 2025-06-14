
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
          inventory(*)
        `)
        .order('name');
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      console.log('Products data fetched:', data);
      
      return data?.map(product => {
        const inventoryRecord = Array.isArray(product.inventory) ? product.inventory[0] : product.inventory;
        const stockLevel = inventoryRecord?.quantity || 0;
        const reorderLevel = inventoryRecord?.reorder_level || 10;
        
        console.log(`Product ${product.name} - Stock: ${stockLevel}, Reorder: ${reorderLevel}`);
        
        return {
          ...product,
          inventory: inventoryRecord || null,
          stock_level: stockLevel,
          is_low_stock: stockLevel <= reorderLevel
        };
      }) || [];
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
          inventory(*)
        `)
        .eq('id', productId)
        .single();
      
      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
      
      const inventoryRecord = Array.isArray(data.inventory) ? data.inventory[0] : data.inventory;
      const stockLevel = inventoryRecord?.quantity || 0;
      const reorderLevel = inventoryRecord?.reorder_level || 10;
      
      return {
        ...data,
        inventory: inventoryRecord || null,
        stock_level: stockLevel,
        is_low_stock: stockLevel <= reorderLevel
      };
    },
    enabled: !!productId,
  });
};
