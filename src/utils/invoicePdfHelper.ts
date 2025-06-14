
import { supabase } from '@/integrations/supabase/client';
import { InvoiceWithDetails } from '@/types/invoice';

export const fetchCompleteInvoiceForPDF = async (invoiceId: string): Promise<InvoiceWithDetails> => {
  console.log('Fetching complete invoice for PDF:', invoiceId);
  
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
    console.error('Error fetching invoice for PDF:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Invoice not found');
  }

  console.log('Fetched invoice data:', data);
  console.log('Invoice items:', data.invoice_items);

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
};
