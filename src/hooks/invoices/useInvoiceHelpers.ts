
import { supabase } from '@/integrations/supabase/client';

export const generateNextInvoiceId = async (): Promise<string> => {
  console.log('Generating next invoice ID...');
  
  const { data: latestInvoices, error } = await supabase
    .from('invoices')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error fetching latest invoices:', error);
    throw error;
  }
  
  console.log('Latest invoices:', latestInvoices);
  
  let maxNumber = 1690;
  
  if (latestInvoices && latestInvoices.length > 0) {
    const numbers = latestInvoices
      .map(invoice => {
        const match = invoice.id.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0);
    
    if (numbers.length > 0) {
      maxNumber = Math.max(...numbers);
    }
  }
  
  const nextNumber = maxNumber + 1;
  console.log('Next invoice number:', nextNumber);
  
  return nextNumber.toString();
};

export const applyCustomerPricing = async (items: any[], customerId: string, invoiceDate: string) => {
  return await Promise.all(
    items.map(async (item) => {
      try {
        const { data: customPrice } = await supabase.rpc('get_customer_price', {
          p_customer_id: customerId,
          p_product_id: item.product_id,
          p_date: invoiceDate
        });
        
        const finalPrice = customPrice || item.price;
        return {
          ...item,
          price: finalPrice,
          total: finalPrice * item.quantity
        };
      } catch (error) {
        console.warn('Failed to get custom price for product:', item.product_id, error);
        return item;
      }
    })
  );
};
