
import { useMutation } from '@tanstack/react-query';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { OutstandingInvoicesReportPDF } from '@/components/reports/OutstandingInvoicesReportPDF';
import { OutstandingInvoice, CustomerSummary } from '@/hooks/useOutstandingInvoices';

interface GeneratePDFParams {
  invoices: OutstandingInvoice[];
  filters?: {
    customerName?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
  };
  customerSummaries: CustomerSummary[]; // Added customerSummaries
  filename?: string;
}

export const useOutstandingInvoicesPDF = () => {
  return useMutation({
    mutationFn: async ({ invoices, filters, customerSummaries, filename }: GeneratePDFParams) => {
      console.log('Generating Outstanding Invoices PDF with customer summaries...');
      
      const blob = await pdf(
        <OutstandingInvoicesReportPDF 
          invoices={invoices} 
          filters={filters} 
          customerSummaries={customerSummaries} // Pass to PDF component
        />
      ).toBlob();
      
      const defaultFilename = `outstanding-invoices-${new Date().toISOString().split('T')[0]}.pdf`;
      saveAs(blob, filename || defaultFilename);
      
      return { success: true, filename: filename || defaultFilename };
    },
  });
};

