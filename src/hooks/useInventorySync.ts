
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to synchronize inventory data across all components
 */
export const useInventorySync = () => {
  const queryClient = useQueryClient();

  const refreshInventoryData = () => {
    console.log('Refreshing all inventory-related queries...');
    
    // Invalidate all inventory-related queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    queryClient.invalidateQueries({ queryKey: ['sku-stock-levels'] });
    queryClient.invalidateQueries({ queryKey: ['top-moving-products'] });
    queryClient.invalidateQueries({ queryKey: ['sku-monthly-movements'] });
    queryClient.invalidateQueries({ queryKey: ['monthly-movements'] });
    queryClient.invalidateQueries({ queryKey: ['variance-summary'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats-optimized'] });
    
    // Force refetch after a short delay to ensure fresh data
    setTimeout(() => {
      queryClient.refetchQueries({ queryKey: ['products'] });
      queryClient.refetchQueries({ queryKey: ['dashboard-stats-optimized'] });
    }, 100);
  };

  const refreshProductData = (productId?: string) => {
    console.log('Refreshing product data for:', productId);
    
    if (productId) {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['product-stock-movements', productId] });
    }
    
    // Always refresh the main products list
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats-optimized'] });
    
    // Force refetch
    setTimeout(() => {
      queryClient.refetchQueries({ queryKey: ['products'] });
      if (productId) {
        queryClient.refetchQueries({ queryKey: ['product', productId] });
      }
    }, 100);
  };

  return { 
    refreshInventoryData, 
    refreshProductData 
  };
};
