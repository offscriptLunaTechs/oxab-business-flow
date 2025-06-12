
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OutstandingInvoice {
  invoice_id: string;
  customer_id: string;
  customer_name: string;
  customer_code: string;
  customer_type: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  days_overdue: number;
  aging_bucket: string;
  status: string;
  payment_status: string;
}

export interface OutstandingInvoicesFilters {
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
}

export const useOutstandingInvoices = (filters?: OutstandingInvoicesFilters) => {
  return useQuery({
    queryKey: ['outstanding-invoices', filters],
    queryFn: async (): Promise<OutstandingInvoice[]> => {
      console.log('Fetching outstanding invoices with filters:', filters);
      
      try {
        const { data, error } = await supabase.rpc('get_outstanding_invoices_report', {
          p_customer_id: filters?.customerId || null,
          p_start_date: filters?.startDate?.toISOString().split('T')[0] || null,
          p_end_date: filters?.endDate?.toISOString().split('T')[0] || null,
          p_min_amount: filters?.minAmount || null,
        });
        
        if (error) {
          console.error('Outstanding invoices error:', error);
          throw new Error(`Failed to fetch outstanding invoices: ${error.message}`);
        }

        console.log('Outstanding invoices loaded:', data?.length || 0, 'records');
        return data || [];
      } catch (err) {
        console.error('Unexpected error in outstanding invoices query:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  });
};
