
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      logger.debug('Fetching invoices...');
      
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
            invoice_id,
            product_id,
            quantity,
            price,
            total,
            products (
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
        logger.error('Error fetching invoices', error);
        throw error;
      }

      // Transform the data to match the expected interface
      const transformedData = data?.map(invoice => ({
        ...invoice,
        status: invoice.status as 'draft' | 'pending' | 'paid' | 'cancelled' | 'overdue',
        customer: {
          ...invoice.customers,
          customer_type: invoice.customers.customer_type as 'wholesale' | 'retail'
        },
        items: invoice.invoice_items?.map(item => ({
          ...item,
          invoice_id: item.invoice_id,
          product: item.products ? {
            ...item.products,
            status: item.products.status as 'active' | 'discontinued' | 'inactive'
          } : undefined
        })) || []
      })) || [];

      logger.debug('Invoices fetched and transformed successfully', {
        count: transformedData.length,
      });
      
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

      logger.debug('Fetching invoice', { invoiceId });

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
            invoice_id,
            product_id,
            quantity,
            price,
            total,
            products (
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
        logger.error('Error fetching invoice', { invoiceId, error });
        throw error;
      }

      // Transform the data to match the expected interface
      const transformedInvoice = {
        ...data,
        status: data.status as 'draft' | 'pending' | 'paid' | 'cancelled' | 'overdue',
        customer: {
          ...data.customers,
          customer_type: data.customers.customer_type as 'wholesale' | 'retail'
        },
        items: data.invoice_items?.map(item => ({
          ...item,
          invoice_id: item.invoice_id,
          product: item.products ? {
            ...item.products,
            status: item.products.status as 'active' | 'discontinued' | 'inactive'
          } : undefined
        })) || []
      };

      logger.debug('Invoice fetched and transformed successfully', {
        invoiceId,
        itemCount: transformedInvoice.items.length,
      });
      
      return transformedInvoice;
    },
    enabled: !!invoiceId,
  });
};
