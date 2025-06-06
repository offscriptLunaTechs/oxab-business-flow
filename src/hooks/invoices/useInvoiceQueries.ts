
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InvoiceWithDetails } from '@/types/invoice';

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!invoices_customer_id_fkey(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async (): Promise<InvoiceWithDetails> => {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!invoices_customer_id_fkey(*)
        `)
        .eq('id', invoiceId)
        .single();
      
      if (invoiceError) throw invoiceError;

      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select(`
          *,
          products!invoice_items_product_id_fkey(*)
        `)
        .eq('invoice_id', invoiceId);
      
      if (itemsError) throw itemsError;

      return {
        ...invoice,
        customer: invoice.customers,
        items: items.map(item => ({
          ...item,
          product: item.products
        }))
      };
    },
    enabled: !!invoiceId,
  });
};
