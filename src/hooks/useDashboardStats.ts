
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  todayInvoices: number;
  pendingInvoices: number;
  lowStockItems: number;
  totalRevenue: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's invoices
      const { data: todayInvoicesData, error: todayError } = await supabase
        .from('invoices')
        .select('id')
        .eq('date', today);
      
      if (todayError) throw todayError;

      // Get pending invoices
      const { data: pendingInvoicesData, error: pendingError } = await supabase
        .from('invoices')
        .select('id')
        .eq('status', 'pending');
      
      if (pendingError) throw pendingError;

      // Get low stock items
      const { data: lowStockData, error: lowStockError } = await supabase
        .from('inventory')
        .select('id')
        .filter('quantity', 'lte', 'reorder_level');
      
      if (lowStockError) throw lowStockError;

      // Get total revenue for current month
      const currentMonth = new Date();
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const { data: revenueData, error: revenueError } = await supabase
        .from('invoices')
        .select('total')
        .eq('status', 'paid')
        .gte('date', firstDay.toISOString().split('T')[0])
        .lte('date', lastDay.toISOString().split('T')[0]);
      
      if (revenueError) throw revenueError;

      const totalRevenue = revenueData?.reduce((sum, invoice) => sum + Number(invoice.total), 0) || 0;

      return {
        todayInvoices: todayInvoicesData?.length || 0,
        pendingInvoices: pendingInvoicesData?.length || 0,
        lowStockItems: lowStockData?.length || 0,
        totalRevenue,
      };
    },
  });
};
