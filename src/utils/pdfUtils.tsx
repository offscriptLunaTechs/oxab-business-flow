
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { supabase } from '@/integrations/supabase/client';
import InvoicePDF from '@/components/invoice/InvoicePDF';
import { InvoiceWithDetails } from '@/types/invoice';

export const downloadInvoicePDF = async (invoice: InvoiceWithDetails) => {
  try {
    console.log('Starting PDF generation for invoice:', invoice.id);
    
    // Ensure we have complete invoice data with items
    let completeInvoice = invoice;
    
    // If invoice doesn't have items or customer data, fetch them
    if (!invoice.items || invoice.items.length === 0 || !invoice.customer) {
      console.log('Fetching complete invoice data for PDF generation');
      
      // Fetch complete invoice with customer and items
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!invoices_customer_id_fkey(*)
        `)
        .eq('id', invoice.id)
        .single();
      
      if (invoiceError) throw invoiceError;
      
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select(`
          *,
          products!invoice_items_product_id_fkey(*)
        `)
        .eq('invoice_id', invoice.id);
      
      if (itemsError) throw itemsError;
      
      completeInvoice = {
        ...invoiceData,
        customer: invoiceData.customers,
        items: items.map(item => ({
          ...item,
          product: item.products
        }))
      };
    }
    
    // Validate we have required data
    if (!completeInvoice.customer) {
      throw new Error('Customer information is required for PDF generation');
    }
    
    if (!completeInvoice.items || completeInvoice.items.length === 0) {
      throw new Error('Invoice items are required for PDF generation');
    }
    
    // Create the PDF blob
    const blob = await pdf(<InvoicePDF invoice={completeInvoice} />).toBlob();
    
    // Download the file
    saveAs(blob, `invoice-${completeInvoice.id}.pdf`);
    
    console.log('PDF generated successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};
