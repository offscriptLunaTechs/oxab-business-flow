
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Hook to ensure all payment-related queries are refreshed after data synchronization
 */
export const usePaymentDataSync = () => {
  const queryClient = useQueryClient();

  const refreshPaymentData = () => {
    // Invalidate all payment-related queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats-optimized'] });
    queryClient.invalidateQueries({ queryKey: ['outstanding-invoices'] });
    queryClient.invalidateQueries({ queryKey: ['customer-payments'] });
    queryClient.invalidateQueries({ queryKey: ['customer-statement-invoices'] });
    queryClient.invalidateQueries({ queryKey: ['customer-outstanding-balance'] });
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  };

  useEffect(() => {
    // Refresh data on mount to ensure consistency after migration
    refreshPaymentData();
  }, []);

  return { refreshPaymentData };
};
