
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOutstandingInvoices } from '@/hooks/useOutstandingInvoices';
import { useOutstandingInvoicesPDF } from '@/hooks/useOutstandingInvoicesPDF';
import { downloadInvoicePDF } from '@/utils/pdfUtils';
import { useToast } from '@/hooks/use-toast';
import AllInvoicesTab from './AllInvoicesTab';
import OutstandingInvoicesTab from './OutstandingInvoicesTab';
import ReportsTab from './ReportsTab';

interface InvoiceTabsContainerProps {
  filteredInvoices: any[];
  invoicesLoading: boolean;
  downloadingInvoiceId: string | null;
  setDownloadingInvoiceId: (id: string | null) => void;
  outstandingFilters: {
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
  };
  allInvoices: any[] | undefined;
}

const InvoiceTabsContainer = ({
  filteredInvoices,
  invoicesLoading,
  downloadingInvoiceId,
  setDownloadingInvoiceId,
  outstandingFilters,
  allInvoices,
}: InvoiceTabsContainerProps) => {
  const { toast } = useToast();
  
  // Outstanding invoices with filters
  const { data: outstandingInvoices = [], isLoading: outstandingLoading } = useOutstandingInvoices(outstandingFilters);
  const generateOutstandingPDF = useOutstandingInvoicesPDF();

  const handleDownloadInvoicePDF = async (invoiceId: string) => {
    setDownloadingInvoiceId(invoiceId);
    try {
      const basicInvoice = allInvoices?.find(inv => inv.id === invoiceId);
      if (!basicInvoice) {
        throw new Error('Invoice not found');
      }
      
      const invoiceForPDF = {
        ...basicInvoice,
        customer: basicInvoice.customers,
        items: []
      };
      
      await downloadInvoicePDF(invoiceForPDF);
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const handleDownloadOutstandingReport = async () => {
    try {
      await generateOutstandingPDF.mutateAsync({
        invoices: outstandingInvoices,
        filters: outstandingFilters,
      });
      toast({
        title: "Success",
        description: "Outstanding invoices report downloaded successfully",
      });
    } catch (error) {
      console.error('Outstanding report PDF error:', error);
      toast({
        title: "Error",
        description: "Failed to generate outstanding report",
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All Invoices ({filteredInvoices.length})</TabsTrigger>
        <TabsTrigger value="outstanding">Outstanding ({outstandingInvoices.length})</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <AllInvoicesTab
          filteredInvoices={filteredInvoices}
          isLoading={invoicesLoading}
          downloadingInvoiceId={downloadingInvoiceId}
          onDownloadInvoicePDF={handleDownloadInvoicePDF}
        />
      </TabsContent>

      <TabsContent value="outstanding">
        <OutstandingInvoicesTab
          outstandingInvoices={outstandingInvoices}
          isLoading={outstandingLoading}
          isPDFGenerating={generateOutstandingPDF.isPending}
          onDownloadReport={handleDownloadOutstandingReport}
        />
      </TabsContent>

      <TabsContent value="reports">
        <ReportsTab
          outstandingInvoices={outstandingInvoices}
          isPDFGenerating={generateOutstandingPDF.isPending}
          onDownloadReport={handleDownloadOutstandingReport}
        />
      </TabsContent>
    </Tabs>
  );
};

export default InvoiceTabsContainer;
