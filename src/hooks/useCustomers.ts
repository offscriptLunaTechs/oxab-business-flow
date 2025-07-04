
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types';

export const useCustomers = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['customers', searchTerm],
    queryFn: async (): Promise<Customer[]> => {
      let query = supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Type assertion to ensure customer_type is properly typed
      return (data || []).map(customer => ({
        ...customer,
        customer_type: customer.customer_type as 'wholesale' | 'retail'
      })) as Customer[];
    },
  });
};

export const useCustomer = (customerId: string) => {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: async (): Promise<Customer> => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (error) throw error;
      
      // Type assertion to ensure customer_type is properly typed
      return {
        ...data,
        customer_type: data.customer_type as 'wholesale' | 'retail'
      } as Customer;
    },
    enabled: !!customerId,
  });
};
