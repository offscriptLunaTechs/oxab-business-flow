
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  todayInvoices: number;
  todayInvoicesChange: string;
  pendingInvoices: number;
  overdueInvoices: number;
  monthlyRevenue: number;
  monthlyRevenueChange: string;
  monthlyRevenueChangeType: 'positive' | 'negative' | 'neutral';
  totalOutstanding: number;
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
    queryKey: ['dashboard-stats-enhanced'],
    queryFn: async (): Promise<DashboardStats> => {
      console.log('Fetching enhanced dashboard stats with real trends...');
      
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        console.error('Dashboard stats error:', error);
        throw error;
      }

      console.log('Enhanced dashboard stats loaded successfully:', data);
      return data as unknown as DashboardStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};
