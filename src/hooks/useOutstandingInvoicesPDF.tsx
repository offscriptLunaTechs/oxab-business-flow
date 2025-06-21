
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { OutstandingInvoice, CustomerSummary } from '@/hooks/useOutstandingInvoices';
import { logger } from '@/utils/logger';

interface GeneratePDFParams {
  invoices: OutstandingInvoice[];
  filters?: {
    customerName?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
  };
  customerSummaries: CustomerSummary[];
  filename?: string;
}

// Dynamically import PDF dependencies to avoid bundling issues
const loadPdfDependencies = async () => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in browser environment');
    }

    const [reactPdfModule, fileSaverModule] = await Promise.all([
      import('@react-pdf/renderer').catch(() => {
        throw new Error('PDF renderer not available');
      }),
      import('file-saver').catch(() => {
        throw new Error('File saver not available');
      })
    ]);
    
    const outstandingInvoicesReportPdfModule = await import('@/components/reports/OutstandingInvoicesReportPDF').catch(() => {
      throw new Error('Outstanding invoices report PDF component not available');
    });
    
    return {
      pdf: reactPdfModule.pdf,
      saveAs: fileSaverModule.saveAs,
      OutstandingInvoicesReportPDF: outstandingInvoicesReportPdfModule.OutstandingInvoicesReportPDF
    };
  } catch (error) {
    logger.error('Failed to load PDF dependencies for outstanding invoices report', error);
    throw new Error('PDF functionality is not available. Please try refreshing the page.');
  }
};

export const useOutstandingInvoicesPDF = () => {
  return useMutation({
    mutationFn: async ({ invoices, filters, customerSummaries, filename }: GeneratePDFParams) => {
      try {
        console.log('Generating Outstanding Invoices PDF with customer summaries...');
        
        // Dynamically load PDF dependencies
        const { pdf, saveAs, OutstandingInvoicesReportPDF } = await loadPdfDependencies();
        
        const pdfDocument = (
          <OutstandingInvoicesReportPDF 
            invoices={invoices} 
            filters={filters} 
            customerSummaries={customerSummaries}
          />
        );
        
        const blob = await pdf(pdfDocument).toBlob();
        
        const defaultFilename = `outstanding-invoices-${new Date().toISOString().split('T')[0]}.pdf`;
        saveAs(blob, filename || defaultFilename);
        
        return { success: true, filename: filename || defaultFilename };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Error generating outstanding invoices PDF', { error: errorMessage });
        
        if (errorMessage.includes('PDF functionality is not available') || 
            errorMessage.includes('not available')) {
          throw new Error('PDF generation is temporarily unavailable. Please try refreshing the page or try again later.');
        }
        
        throw error;
      }
    },
  });
};
