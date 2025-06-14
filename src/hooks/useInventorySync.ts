
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to synchronize inventory data across all components
 */
export const useInventorySync = () => {
  const queryClient = useQueryClient();

  const refreshInventoryData = () => {
    // Invalidate all inventory-related queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    queryClient.invalidateQueries({ queryKey: ['sku-stock-levels'] });
    queryClient.invalidateQueries({ queryKey: ['top-moving-products'] });
    queryClient.invalidateQueries({ queryKey: ['sku-monthly-movements'] });
    queryClient.invalidateQueries({ queryKey: ['monthly-movements'] });
    queryClient.invalidateQueries({ queryKey: ['variance-summary'] });
  };

  const refreshProductData = (productId?: string) => {
    if (productId) {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['product-stock-movements', productId] });
    }
    // Always refresh the main products list
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  return { 
    refreshInventoryData, 
    refreshProductData 
  };
};
