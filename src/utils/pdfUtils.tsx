
import React from 'react';
import { InvoiceWithDetails, Product } from '@/types/invoice';
import { logger } from './logger';

// Dynamically import PDF dependencies to avoid bundling issues
const loadPdfDependencies = async () => {
  try {
    const [
      { pdf, Font }, 
      { saveAs }, 
      InvoicePDFModule
    ] = await Promise.all([
      import('@react-pdf/renderer'),
      import('file-saver'),
      import('@/components/invoice/InvoicePDF')
    ]);
    
    return {
      pdf,
      Font,
      saveAs,
      InvoicePDF: InvoicePDFModule.default
    };
  } catch (error) {
    logger.error('Failed to load PDF dependencies', error);
    throw new Error('PDF functionality is not available');
  }
};

// Register fonts only when PDF dependencies are loaded
const registerFonts = async (Font: any) => {
  try {
    // Minimal font registration to avoid conflicts
    Font.registerHyphenationCallback((word: string) => {
      return word ? [word] : [];
    });
    
    logger.debug('PDF fonts registered successfully');
  } catch (error) {
    logger.warn('Failed to register custom PDF fonts, using defaults', error);
  }
};

export const downloadInvoicePDF = async (invoice: InvoiceWithDetails) => {
  logger.info('Starting dynamic PDF generation', { invoiceId: invoice.id });
  
  try {
    // Dynamically load PDF dependencies
    const { pdf, Font, saveAs, InvoicePDF } = await loadPdfDependencies();
    
    // Register fonts after loading dependencies
    await registerFonts(Font);
    
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

    // Generate PDF
    const blob = await pdf(React.createElement(InvoicePDF, { invoice: processedInvoice })).toBlob();
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
    if (error instanceof Error && error.message.includes('PDF functionality is not available')) {
      throw new Error('PDF generation is temporarily unavailable. Please try again later.');
    }
    
    throw error; 
  }
};
