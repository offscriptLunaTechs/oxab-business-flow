
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InvoiceWithDetails } from '@/types/invoice';

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async (): Promise<InvoiceWithDetails[]> => {
      console.log('Fetching invoices with details...');
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!inner(
            id,
            name,
            code,
            email,
            phone,
            address,
            customer_type,
            loyalty_points,
            created_at,
            updated_at
          ),
          invoice_items(
            id,
            invoice_id,
            product_id,
            quantity,
            price,
            total,
            created_at,
            updated_at,
            products(
              id,
              name,
              sku,
              size,
              base_price,
              pack_size,
              trademark,
              description,
              status,
              created_at,
              updated_at
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }

      console.log('Raw invoices data:', data);

      return data?.map(invoice => ({
        ...invoice,
        status: invoice.status as 'draft' | 'pending' | 'paid' | 'cancelled' | 'overdue',
        customer: {
          ...invoice.customers,
          customer_type: invoice.customers.customer_type as 'wholesale' | 'retail'
        },
        items: invoice.invoice_items?.map(item => ({
          ...item,
          product: item.products ? {
            ...item.products,
            status: item.products.status as 'active' | 'discontinued' | 'inactive'
          } : undefined
        })) || []
      })) || [];
    },
    staleTime: 30000,
  });
};

export const useInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async (): Promise<InvoiceWithDetails> => {
      console.log('Fetching single invoice:', invoiceId);
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!inner(
            id,
            name,
            code,
            email,
            phone,
            address,
            customer_type,
            loyalty_points,
            created_at,
            updated_at
          ),
          invoice_items(
            id,
            invoice_id,
            product_id,
            quantity,
            price,
            total,
            created_at,
            updated_at,
            products(
              id,
              name,
              sku,
              size,
              base_price,
              pack_size,
              trademark,
              description,
              status,
              created_at,
              updated_at
            )
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (error) {
        console.error('Error fetching invoice:', error);
        throw error;
      }

      console.log('Single invoice data:', data);

      return {
        ...data,
        status: data.status as 'draft' | 'pending' | 'paid' | 'cancelled' | 'overdue',
        customer: {
          ...data.customers,
          customer_type: data.customers.customer_type as 'wholesale' | 'retail'
        },
        items: data.invoice_items?.map(item => ({
          ...item,
          product: item.products ? {
            ...item.products,
            status: item.products.status as 'active' | 'discontinued' | 'inactive'
          } : undefined
        })) || []
      };
    },
    enabled: !!invoiceId,
    staleTime: 30000,
  });
};
