
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
            customer_type,
            phone,
            email,
            address,
            created_at,
            updated_at
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

      // Transform the data to match the expected interface
      const transformedData = data?.map(invoice => ({
        ...invoice,
        customer: invoice.customers,
        items: invoice.invoice_items?.map(item => ({
          ...item,
          product: item.products
        })) || []
      })) || [];

      console.log('Invoices fetched and transformed successfully:', transformedData);
      return transformedData;
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
            customer_type,
            phone,
            email,
            address,
            created_at,
            updated_at
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

      // Transform the data to match the expected interface
      const transformedInvoice = {
        ...data,
        customer: data.customers,
        items: data.invoice_items?.map(item => ({
          ...item,
          product: item.products
        })) || []
      };

      console.log('Invoice fetched and transformed successfully:', transformedInvoice);
      return transformedInvoice;
    },
    enabled: !!invoiceId,
  });
};
