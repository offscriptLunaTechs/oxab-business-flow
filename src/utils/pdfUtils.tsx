

import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { supabase } from '@/integrations/supabase/client';
import InvoicePDF from '@/components/invoice/InvoicePDF';
import { InvoiceWithDetails } from '@/types/invoice';

export const downloadInvoicePDF = async (invoice: InvoiceWithDetails) => {
  try {
    console.log('Starting PDF generation for invoice:', invoice.id);
    
    // If invoice doesn't have items, fetch them
    if (!invoice.items || invoice.items.length === 0) {
      console.log('Fetching invoice items for PDF generation');
      
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select(`
          *,
          products!invoice_items_product_id_fkey(*)
        `)
        .eq('invoice_id', invoice.id);
      
      if (itemsError) throw itemsError;
      
      invoice.items = items.map(item => ({
        ...item,
        product: item.products
      }));
    }
    
    // Create the PDF blob - pass component directly
    const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
    
    // Download the file
    saveAs(blob, `invoice-${invoice.id}.pdf`);
    
    console.log('PDF generated successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

