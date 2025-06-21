
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      console.log('Fetching invoices...');
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (
            id,
            name,
            code,
            customer_type
          ),
          invoice_items (
            id,
            product_id,
            quantity,
            price,
            total,
            products (
              id,
              name,
              sku,
              size
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }

      console.log('Invoices fetched successfully:', data);
      return data;
    },
  });
};

export const useInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) {
        throw new Error('Invoice ID is required');
      }

      console.log('Fetching invoice with ID:', invoiceId);

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (
            id,
            name,
            code,
            customer_type
          ),
          invoice_items (
            id,
            product_id,
            quantity,
            price,
            total,
            products (
              id,
              name,
              sku,
              size
            )
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (error) {
        console.error('Error fetching invoice:', error);
        throw error;
      }

      console.log('Invoice fetched successfully:', data);
      return data;
    },
    enabled: !!invoiceId,
  });
};
