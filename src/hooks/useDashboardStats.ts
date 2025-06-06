
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  todayInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  monthlyRevenue: number;
  lowStockCount: number;
  topCustomers: Array<{
    name: string;
    total_spent: number;
  }>;
  recentActivity: Array<{
    type: string;
    id: string;
    description: string;
    amount: number;
    timestamp: string;
  }>;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats-optimized'],
    queryFn: async (): Promise<DashboardStats> => {
      console.log('Fetching optimized dashboard stats...');
      
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        console.error('Dashboard stats error:', error);
        throw error;
      }

      console.log('Dashboard stats loaded successfully:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};
