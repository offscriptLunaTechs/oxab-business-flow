
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, InventoryItem } from '@/types/invoice';

export interface ProductWithInventory extends Product {
  inventory: InventoryItem | null;
  stock_level?: number;
  is_low_stock?: boolean;
  is_discontinued?: boolean;
}

export const useProducts = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['products', searchTerm],
    queryFn: async (): Promise<ProductWithInventory[]> => {
      console.log('Fetching products with inventory...');
      
      let query = supabase
        .from('products')
        .select(`
          *,
          inventory (
            id,
            quantity,
            reorder_level,
            last_updated,
            created_at,
            notes,
            last_restock_date
          )
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
      
      console.log('Raw products data:', data);
      
      return data?.map(product => {
        const inventoryRecord = Array.isArray(product.inventory) ? product.inventory[0] : product.inventory;
        const stockLevel = inventoryRecord?.quantity || 0;
        const reorderLevel = inventoryRecord?.reorder_level || 10;
        const isDiscontinued = product.status === 'discontinued';
        
        console.log(`Product ${product.name} (${product.sku}) - Status: ${product.status}, Stock: ${stockLevel}, Reorder: ${reorderLevel}, Low Stock: ${!isDiscontinued && stockLevel <= reorderLevel}`);
        
        return {
          ...product,
          inventory: inventoryRecord || null,
          stock_level: stockLevel,
          is_low_stock: !isDiscontinued && stockLevel <= reorderLevel,
          is_discontinued: isDiscontinued
        };
      }) || [];
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async (): Promise<ProductWithInventory> => {
      console.log('Fetching single product with inventory:', productId);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          inventory (
            id,
            quantity,
            reorder_level,
            last_updated,
            created_at,
            notes,
            last_restock_date
          )
        `)
        .eq('id', productId)
        .single();
      
      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
      
      console.log('Single product data:', data);
      
      const inventoryRecord = Array.isArray(data.inventory) ? data.inventory[0] : data.inventory;
      const stockLevel = inventoryRecord?.quantity || 0;
      const reorderLevel = inventoryRecord?.reorder_level || 10;
      const isDiscontinued = data.status === 'discontinued';
      
      console.log(`Single product ${data.name} - Status: ${data.status}, Stock: ${stockLevel}, Reorder: ${reorderLevel}`);
      
      return {
        ...data,
        inventory: inventoryRecord || null,
        stock_level: stockLevel,
        is_low_stock: !isDiscontinued && stockLevel <= reorderLevel,
        is_discontinued: isDiscontinued
      };
    },
    enabled: !!productId,
    staleTime: 30000, // 30 seconds
  });
};
