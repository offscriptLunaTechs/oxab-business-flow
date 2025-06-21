
import React from 'react';
import { InvoiceWithDetails, Product } from '@/types/invoice';
import { logger } from './logger';

// Simplified dynamic import approach
const loadPdfDependencies = async () => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in browser environment');
    }

    // Import modules individually
    const reactPdfModule = await import('@react-pdf/renderer');
    const fileSaverModule = await import('file-saver');
    const invoicePdfModule = await import('@/components/invoice/InvoicePDF');
    
    return {
      pdf: reactPdfModule.pdf,
      saveAs: fileSaverModule.saveAs,
      InvoicePDF: invoicePdfModule.default
    };
  } catch (error) {
    logger.error('Failed to load PDF dependencies', error);
    throw new Error('PDF functionality is not available. Please try again or contact support.');
  }
};

export const downloadInvoicePDF = async (invoice: InvoiceWithDetails) => {
  logger.info('Starting dynamic PDF generation', { invoiceId: invoice.id });
  
  try {
    // Load dependencies
    const { pdf, saveAs, InvoicePDF } = await loadPdfDependencies();
    
    // Process invoice data with defaults for missing product details
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

    // Generate PDF
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
    throw new Error('Failed to generate PDF. Please try again.');
  }
};
