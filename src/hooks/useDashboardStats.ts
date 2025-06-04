
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
      
      console.log('Fetching dashboard stats for date:', today);
      
      // Get today's invoices
      const { data: todayInvoicesData, error: todayError } = await supabase
        .from('invoices')
        .select('id')
        .eq('date', today);
      
      if (todayError) {
        console.error('Today invoices error:', todayError);
        throw todayError;
      }

      // Get pending invoices
      const { data: pendingInvoicesData, error: pendingError } = await supabase
        .from('invoices')
        .select('id')
        .eq('status', 'pending');
      
      if (pendingError) {
        console.error('Pending invoices error:', pendingError);
        throw pendingError;
      }

      // Get low stock items - use a simple query and filter in JavaScript
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('id, quantity, reorder_level');
      
      if (inventoryError) {
        console.error('Inventory error:', inventoryError);
        throw inventoryError;
      }

      // Filter low stock items in JavaScript
      const lowStockItems = inventoryData?.filter(item => 
        item.quantity <= item.reorder_level
      ) || [];
      
      console.log('Low stock items found:', lowStockItems.length);

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
      
      if (revenueError) {
        console.error('Revenue error:', revenueError);
        throw revenueError;
      }

      const totalRevenue = revenueData?.reduce((sum, invoice) => sum + Number(invoice.total), 0) || 0;

      console.log('Dashboard stats calculated:', {
        todayInvoices: todayInvoicesData?.length || 0,
        pendingInvoices: pendingInvoicesData?.length || 0,
        lowStockItems: lowStockItems.length,
        totalRevenue,
      });

      return {
        todayInvoices: todayInvoicesData?.length || 0,
        pendingInvoices: pendingInvoicesData?.length || 0,
        lowStockItems: lowStockItems.length,
        totalRevenue,
      };
    },
  });
};
