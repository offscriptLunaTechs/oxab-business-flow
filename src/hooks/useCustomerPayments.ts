
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerPayment {
  id: string;
  customer_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface InvoicePayment {
  id: string;
  payment_id: string;
  invoice_id: string;
  allocated_amount: number;
  created_at: string;
}

export const useCustomerPayments = (customerId?: string) => {
  return useQuery({
    queryKey: ['customer-payments', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from('customer_payments')
        .select(`
          *,
          invoice_payments (
            id,
            invoice_id,
            allocated_amount,
            invoices (
              id,
              total,
              date,
              status
            )
          )
        `)
        .eq('customer_id', customerId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as CustomerPayment[];
    },
    enabled: !!customerId,
  });
};

export const useCreateCustomerPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: Omit<CustomerPayment, 'id' | 'created_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('customer_payments')
        .insert({
          ...payment,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer-payments'] });
      queryClient.invalidateQueries({ queryKey: ['customer-statement'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useCustomerOutstandingBalance = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-outstanding-balance', customerId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_customer_outstanding_balance', {
        p_customer_id: customerId
      });

      if (error) throw error;
      return data as number;
    },
    enabled: !!customerId,
  });
};
