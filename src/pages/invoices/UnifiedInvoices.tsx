
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Plus, Eye, Edit, Download, Calendar, AlertTriangle, Filter, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInvoices, useUpdateInvoice } from '@/hooks/useInvoices';
import { useOutstandingInvoices } from '@/hooks/useOutstandingInvoices';
import { useOutstandingInvoicesPDF } from '@/hooks/useOutstandingInvoicesPDF';
import { useCustomers } from '@/hooks/useCustomers';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { downloadInvoicePDF } from '@/utils/pdfUtils';
import { useToast } from '@/hooks/use-toast';

const UnifiedInvoices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('');
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
    customerId: customerFilter || undefined,
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
    
    const matchesCustomer = !customerFilter || invoice.customer_id === customerFilter;
    
    const matchesStartDate = !startDate || new Date(invoice.date) >= startDate;
    const matchesEndDate = !endDate || new Date(invoice.date) <= endDate;
    
    const matchesMinAmount = !minAmount || Number(invoice.total) >= minAmount;
    
    return matchesSearch && matchesStatus && matchesCustomer && matchesStartDate && matchesEndDate && matchesMinAmount;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (invoiceId: string, newStatus: string) => {
    try {
      await updateInvoiceMutation.mutateAsync({
        invoiceId,
        invoiceData: { status: newStatus }
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

  const handleDownloadInvoicePDF = async (invoiceId: string) => {
    setDownloadingInvoiceId(invoiceId);
    try {
      // Find the invoice in our data
      const invoice = allInvoices?.find(inv => inv.id === invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
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
    setCustomerFilter('');
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
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Customers</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DatePicker
              date={startDate}
              onDateChange={setStartDate}
              placeholder="From date"
            />

            <DatePicker
              date={endDate}
              onDateChange={setEndDate}
              placeholder="To date"
            />

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min amount"
                value={minAmount || ''}
                onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : undefined)}
                step="0.01"
              />
              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Invoices ({filteredInvoices.length})</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding ({outstandingInvoices.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* All Invoices Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No invoices found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>{invoice.customers?.name}</TableCell>
                          <TableCell>{format(new Date(invoice.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>KWD {Number(invoice.total).toFixed(3)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/invoices/${invoice.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadInvoicePDF(invoice.id)}
                                disabled={downloadingInvoiceId === invoice.id}
                              >
                                {downloadingInvoiceId === invoice.id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outstanding Invoices Tab */}
        <TabsContent value="outstanding">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Outstanding Invoices
                </CardTitle>
                <Button 
                  onClick={handleDownloadOutstandingReport}
                  disabled={generateOutstandingPDF.isPending}
                  variant="outline"
                >
                  {generateOutstandingPDF.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {outstandingLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : outstandingInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-600">No outstanding invoices found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Outstanding</TableHead>
                        <TableHead>Days Overdue</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outstandingInvoices.map((invoice) => (
                        <TableRow key={invoice.invoice_id}>
                          <TableCell className="font-medium">{invoice.invoice_id}</TableCell>
                          <TableCell>{invoice.customer_name}</TableCell>
                          <TableCell>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>KWD {Number(invoice.total_amount).toFixed(3)}</TableCell>
                          <TableCell className="text-red-600 font-semibold">
                            KWD {Number(invoice.outstanding_amount).toFixed(3)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={invoice.days_overdue > 0 ? 'destructive' : 'secondary'}>
                              {invoice.days_overdue > 0 ? `+${invoice.days_overdue}` : 'Current'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              invoice.payment_status === 'overdue' ? 'destructive' : 
                              invoice.payment_status === 'partially_paid' ? 'secondary' : 'default'
                            }>
                              {invoice.payment_status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={handleDownloadOutstandingReport}
                    disabled={generateOutstandingPDF.isPending}
                  >
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    <span>Outstanding Invoices Report</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => navigate('/reports/outstanding-invoices')}
                  >
                    <FileText className="h-6 w-6" />
                    <span>Detailed Reports Dashboard</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                      <p className="text-2xl font-bold text-red-600">
                        KWD {outstandingInvoices.reduce((sum, inv) => sum + inv.outstanding_amount, 0).toFixed(3)}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Outstanding Count</p>
                      <p className="text-2xl font-bold">{outstandingInvoices.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Outstanding</p>
                      <p className="text-2xl font-bold">
                        KWD {outstandingInvoices.length > 0 ? 
                          (outstandingInvoices.reduce((sum, inv) => sum + inv.outstanding_amount, 0) / outstandingInvoices.length).toFixed(3) : 
                          '0.000'
                        }
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedInvoices;
