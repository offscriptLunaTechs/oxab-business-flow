
import { useMutation } from '@tanstack/react-query';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { OutstandingInvoicesReportPDF } from '@/components/reports/OutstandingInvoicesReportPDF';
import { OutstandingInvoice } from '@/hooks/useOutstandingInvoices';

interface GeneratePDFParams {
  invoices: OutstandingInvoice[];
  filters?: {
    customerName?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
  };
  filename?: string;
}

export const useOutstandingInvoicesPDF = () => {
  return useMutation({
    mutationFn: async ({ invoices, filters, filename }: GeneratePDFParams) => {
      console.log('Generating Outstanding Invoices PDF...');
      
      // Create the PDF document as a JSX element
      const pdfDocument = <OutstandingInvoicesReportPDF invoices={invoices} filters={filters} />;
      
      const blob = await pdf(pdfDocument).toBlob();
      
      const defaultFilename = `outstanding-invoices-${new Date().toISOString().split('T')[0]}.pdf`;
      saveAs(blob, filename || defaultFilename);
      
      return { success: true, filename: filename || defaultFilename };
    },
  });
};
