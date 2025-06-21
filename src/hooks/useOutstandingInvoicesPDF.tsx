
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

// Simplified dynamic import approach
const loadPdfDependencies = async () => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in browser environment');
    }

    // Import modules individually with proper error handling
    const reactPdfModule = await import('@react-pdf/renderer');
    const fileSaverModule = await import('file-saver');
    const outstandingInvoicesReportPdfModule = await import('@/components/reports/OutstandingInvoicesReportPDF');
    
    return {
      pdf: reactPdfModule.pdf,
      saveAs: fileSaverModule.saveAs,
      OutstandingInvoicesReportPDF: outstandingInvoicesReportPdfModule.OutstandingInvoicesReportPDF
    };
  } catch (error) {
    logger.error('Failed to load PDF dependencies for outstanding invoices report', error);
    throw new Error('PDF functionality is not available. Please try again or contact support.');
  }
};

export const useOutstandingInvoicesPDF = () => {
  return useMutation({
    mutationFn: async ({ invoices, filters, customerSummaries, filename }: GeneratePDFParams) => {
      try {
        console.log('Generating Outstanding Invoices PDF with customer summaries...');
        
        // Load dependencies
        const { pdf, saveAs, OutstandingInvoicesReportPDF } = await loadPdfDependencies();
        
        // Create PDF document
        const pdfBlob = await pdf(
          <OutstandingInvoicesReportPDF 
            invoices={invoices} 
            filters={filters} 
            customerSummaries={customerSummaries}
          />
        ).toBlob();
        
        const defaultFilename = `outstanding-invoices-${new Date().toISOString().split('T')[0]}.pdf`;
        saveAs(pdfBlob, filename || defaultFilename);
        
        return { success: true, filename: filename || defaultFilename };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Error generating outstanding invoices PDF', { error: errorMessage });
        throw new Error('Failed to generate PDF report. Please try again.');
      }
    },
  });
};
