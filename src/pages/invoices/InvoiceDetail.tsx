
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoice, useUpdateInvoice } from '@/hooks/useInvoices';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { downloadInvoicePDF } from '@/utils/pdfUtils';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import InvoiceDetailHeader from '@/components/invoices/InvoiceDetailHeader';
import InvoiceInfoCard from '@/components/invoices/InvoiceInfoCard';
import CustomerInfoCard from '@/components/invoices/CustomerInfoCard';
import InvoiceItemsCard from '@/components/invoices/InvoiceItemsCard';

const InvoiceDetail = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  console.log('InvoiceDetail - invoiceId from params:', invoiceId);
  
  const { data: invoice, isLoading, error } = useInvoice(invoiceId || '');
  const updateInvoiceMutation = useUpdateInvoice();

  console.log('InvoiceDetail - invoice data:', invoice);
  console.log('InvoiceDetail - isLoading:', isLoading);
  console.log('InvoiceDetail - error:', error);

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    
    try {
      console.log('Generating PDF for invoice:', invoice.id);
      await downloadInvoicePDF(invoice);
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
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!invoice) return;
    
    try {
      await updateInvoiceMutation.mutateAsync({
        invoiceId: invoice.id,
        invoiceData: { status: newStatus as 'draft' | 'pending' | 'paid' | 'cancelled' | 'overdue' }
      });
      toast({
        title: "Success",
        description: `Invoice status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    console.error('Invoice loading error:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          Error loading invoice: {error.message}
        </p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/invoices')} 
          className="mt-4"
        >
          Back to Invoices
        </Button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Invoice not found</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/invoices')} 
          className="mt-4"
        >
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <InvoiceDetailHeader
        invoice={invoice}
        onStatusUpdate={handleStatusUpdate}
        onDownloadPDF={handleDownloadPDF}
        isUpdating={updateInvoiceMutation.isPending}
      />

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
        <div className={`space-y-6 ${isMobile ? 'order-2' : 'lg:col-span-2'}`}>
          <InvoiceInfoCard invoice={invoice} />
          <InvoiceItemsCard
            items={invoice.items || []}
            subtotal={invoice.subtotal}
            discount={invoice.discount}
            tax={invoice.tax}
            total={invoice.total}
          />
        </div>

        <div className={`space-y-6 ${isMobile ? 'order-1' : ''}`}>
          <CustomerInfoCard
            customer={invoice.customer}
            notes={invoice.notes}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
