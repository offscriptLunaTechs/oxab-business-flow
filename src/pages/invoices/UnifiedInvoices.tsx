
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvoices, useUpdateInvoice } from '@/hooks/useInvoices';
import { useOutstandingInvoices } from '@/hooks/useOutstandingInvoices';
import { useOutstandingInvoicesPDF } from '@/hooks/useOutstandingInvoicesPDF';
import { useCustomers } from '@/hooks/useCustomers';
import { downloadInvoicePDF } from '@/utils/pdfUtils';
import { useToast } from '@/hooks/use-toast';
import InvoiceFilters from '@/components/invoices/InvoiceFilters';
import AllInvoicesTab from '@/components/invoices/AllInvoicesTab';
import OutstandingInvoicesTab from '@/components/invoices/OutstandingInvoicesTab';
import ReportsTab from '@/components/invoices/ReportsTab';

const UnifiedInvoices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [minAmount, setMinAmount] = useState<number | undefined>();
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  
  // Data hooks
  const { data: allInvoices, isLoading: invoicesLoading, error: invoicesError } = useInvoices();
  const { data: customers = [] } = useCustomers();
  const updateInvoiceMutation = useUpdateInvoice();
  
  // Outstanding invoices with filters
  const outstandingFilters = {
    customerId: customerFilter !== 'all' ? customerFilter : undefined,
    startDate,
    endDate,
    minAmount,
  };
  const { data: outstandingInvoices = [], isLoading: outstandingLoading } = useOutstandingInvoices(outstandingFilters);
  const generateOutstandingPDF = useOutstandingInvoicesPDF();

  // Filter all invoices
  const filteredInvoices = allInvoices?.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customers?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    const matchesCustomer = customerFilter === 'all' || invoice.customer_id === customerFilter;
    
    const matchesStartDate = !startDate || new Date(invoice.date) >= startDate;
    const matchesEndDate = !endDate || new Date(invoice.date) <= endDate;
    
    const matchesMinAmount = !minAmount || Number(invoice.total) >= minAmount;
    
    return matchesSearch && matchesStatus && matchesCustomer && matchesStartDate && matchesEndDate && matchesMinAmount;
  }) || [];

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

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCustomerFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setMinAmount(undefined);
  };

  if (invoicesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading invoices: {invoicesError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices & Reports</h1>
          <p className="text-gray-600">Comprehensive invoice management and reporting</p>
        </div>
        <Button 
          onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <InvoiceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        customerFilter={customerFilter}
        setCustomerFilter={setCustomerFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        minAmount={minAmount}
        setMinAmount={setMinAmount}
        customers={customers}
        onClearFilters={clearFilters}
      />

      {/* Tabs for different views */}
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
    </div>
  );
};

export default UnifiedInvoices;
