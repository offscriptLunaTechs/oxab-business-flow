
import React from 'react';
import { InvoiceWithDetails, Product } from '@/types/invoice';
import { logger } from './logger';

// Dynamically import PDF dependencies to avoid bundling issues
const loadPdfDependencies = async () => {
  try {
    // Use dynamic imports with error handling for each module
    const [reactPdfModule, fileSaverModule] = await Promise.all([
      import('@react-pdf/renderer').catch(() => {
        throw new Error('PDF renderer not available');
      }),
      import('file-saver').catch(() => {
        throw new Error('File saver not available');
      })
    ]);

    // Dynamic import for the PDF component
    const invoicePdfModule = await import('@/components/invoice/InvoicePDF').catch(() => {
      throw new Error('Invoice PDF component not available');
    });
    
    return {
      pdf: reactPdfModule.pdf,
      Font: reactPdfModule.Font,
      saveAs: fileSaverModule.saveAs,
      InvoicePDF: invoicePdfModule.default
    };
  } catch (error) {
    logger.error('Failed to load PDF dependencies', error);
    throw new Error('PDF functionality is not available. Please try refreshing the page.');
  }
};

export const downloadInvoicePDF = async (invoice: InvoiceWithDetails) => {
  logger.info('Starting dynamic PDF generation', { invoiceId: invoice.id });
  
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in browser environment');
    }

    // Dynamically load PDF dependencies
    const { pdf, saveAs, InvoicePDF } = await loadPdfDependencies();
    
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

    // Generate PDF - Create JSX element properly
    const pdfDocument = <InvoicePDF invoice={processedInvoice} />;
    const blob = await pdf(pdfDocument).toBlob();
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
    
    // Provide user-friendly error message
    if (error instanceof Error) {
      if (error.message.includes('PDF functionality is not available') || 
          error.message.includes('not available')) {
        throw new Error('PDF generation is temporarily unavailable. Please try refreshing the page or try again later.');
      }
    }
    
    throw error; 
  }
};
