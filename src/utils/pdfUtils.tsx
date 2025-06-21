
import React from 'react';
import { pdf, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { InvoiceWithDetails, Product } from '@/types/invoice';
import InvoicePDF from '@/components/invoice/InvoicePDF';
import { logger } from './logger';

// Register fonts with error handling
try {
  Font.register({
    family: 'Helvetica',
    fonts: [
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf', fontWeight: 'normal' },
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Bold.ttf', fontWeight: 'bold' },
    ]
  });

  Font.registerHyphenationCallback(word => (word ? [word] : []));
  
  logger.debug('PDF fonts registered successfully');
} catch (error) {
  logger.error('Failed to register PDF fonts', error);
}

export const downloadInvoicePDF = async (invoice: InvoiceWithDetails) => {
  logger.info('Starting PDF generation', { invoiceId: invoice.id });
  
  // Ensure product details are available and provide sensible defaults if completely missing.
  const processedInvoice = {
    ...invoice,
    items: invoice.items.map(item => {
      const defaultProduct: Product = {
        id: '',
        name: 'N/A',
        sku: 'N/A',
        size: '',
        base_price: 0,
        status: 'inactive',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return {
        ...item,
        product: item.product || defaultProduct
      };
    })
  };

  try {
    const blob = await pdf(<InvoicePDF invoice={processedInvoice} />).toBlob();
    saveAs(blob, `invoice-${invoice.id}.pdf`);
    
    logger.info('PDF generated and downloaded successfully', {
      invoiceId: invoice.id,
      filename: `invoice-${invoice.id}.pdf`,
      size: blob.size,
    });
  } catch (error) {
    logger.error('Error generating PDF', {
      invoiceId: invoice.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error; 
  }
};
