
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AccountStatement {
  id: string;
  customer_id: string;
  statement_date: string;
  period_start: string;
  period_end: string;
  opening_balance: number;
  closing_balance: number;
  total_outstanding: number;
  invoice_count: number;
  customer_name: string;
  customer_code: string;
  customer_email: string;
  customer_type: string;
  account_status: string;
  created_at: string;
  updated_at: string;
}

export const useAccountStatements = () => {
  return useQuery({
    queryKey: ['customer-statements'],
    queryFn: async (): Promise<AccountStatement[]> => {
      const { data, error } = await supabase
        .from('customer_statements_view')
        .select('*')
        .order('statement_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCustomerStatements = (customerId?: string) => {
  return useQuery({
    queryKey: ['customer-statements', customerId],
    queryFn: async (): Promise<AccountStatement[]> => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from('customer_statements_view')
        .select('*')
        .eq('customer_id', customerId)
        .order('statement_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
  });
};
