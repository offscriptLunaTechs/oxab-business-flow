
import React, { useState, useMemo } from 'react';
import { FileText, Download, Filter, Search, AlertTriangle, Clock, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useOutstandingInvoices, useCustomerSummaries, OutstandingInvoicesFilters } from '@/hooks/useOutstandingInvoices';
import { useOutstandingInvoicesPDF } from '@/hooks/useOutstandingInvoicesPDF';
import { useCustomers } from '@/hooks/useCustomers';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const OutstandingInvoicesReport = () => {
  const [filters, setFilters] = useState<OutstandingInvoicesFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [minAmountFilter, setMinAmountFilter] = useState('');
  const { toast } = useToast();

  const { data: customers = [] } = useCustomers();
  const { data: invoices = [], isLoading, error } = useOutstandingInvoices(filters);
  const generatePDFMutation = useOutstandingInvoicesPDF();

  // Filter invoices based on search term
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.invoice_id.toLowerCase().includes(term) ||
        invoice.customer_name.toLowerCase().includes(term) ||
        invoice.customer_code.toLowerCase().includes(term)
      );
    }

    if (minAmountFilter) {
      const minAmount = parseFloat(minAmountFilter);
      if (!isNaN(minAmount)) {
        filtered = filtered.filter(invoice => invoice.outstanding_amount >= minAmount);
      }
    }

    return filtered;
  }, [invoices, searchTerm, minAmountFilter]);

  const customerSummaries = useCustomerSummaries(filteredInvoices);

  // Calculate summary statistics
  const totalOutstanding = filteredInvoices.reduce((sum, inv) => sum + inv.outstanding_amount, 0);
  const overdueInvoices = filteredInvoices.filter(inv => inv.days_overdue > 0);
  const currentInvoices = filteredInvoices.filter(inv => inv.days_overdue === 0);

  // Calculate aging buckets
  const agingBuckets = useMemo(() => {
    const buckets = {
      'Current': 0,
      '1-30 Days': 0,
      '31-60 Days': 0,
      '61-90 Days': 0,
      '90+ Days': 0,
    };

    filteredInvoices.forEach(invoice => {
      buckets[invoice.aging_bucket as keyof typeof buckets] += invoice.outstanding_amount;
    });

    return buckets;
  }, [filteredInvoices]);

  const handleExportPDF = async () => {
    try {
      const selectedCustomer = customers.find(c => c.id === filters.customerId);
      
      await generatePDFMutation.mutateAsync({
        invoices: filteredInvoices,
        filters: {
          customerName: selectedCustomer?.name,
          startDate: filters.startDate,
          endDate: filters.endDate,
          minAmount: filters.minAmount,
        },
      });
      
      toast({
        title: "Success",
        description: "Outstanding Invoices report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgingColor = (agingBucket: string) => {
    switch (agingBucket) {
      case 'Current': return 'bg-green-100 text-green-800';
      case '1-30 Days': return 'bg-yellow-100 text-yellow-800';
      case '31-60 Days': return 'bg-orange-100 text-orange-800';
      case '61-90 Days': return 'bg-red-100 text-red-800';
      case '90+ Days': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Error loading outstanding invoices: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Outstanding Invoices Report</h1>
          <p className="text-gray-600">Track unpaid invoices and aging analysis</p>
        </div>
        <Button 
          onClick={handleExportPDF}
          disabled={generatePDFMutation.isPending || filteredInvoices.length === 0}
          className="flex items-center gap-2"
        >
          {generatePDFMutation.isPending ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KWD {totalOutstanding.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground">
              Across {filteredInvoices.length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              KWD {overdueInvoices.reduce((sum, inv) => sum + inv.outstanding_amount, 0).toFixed(3)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Invoices</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              KWD {currentInvoices.reduce((sum, inv) => sum + inv.outstanding_amount, 0).toFixed(3)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerSummaries.length}
            </div>
            <p className="text-xs text-muted-foreground">
              With outstanding balances
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Code</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Invoice Count</TableHead>
                  <TableHead>Total Outstanding</TableHead>
                  <TableHead>Oldest Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerSummaries.slice(0, 10).map((customer) => (
                  <TableRow key={customer.customer_id}>
                    <TableCell className="font-medium">{customer.customer_code}</TableCell>
                    <TableCell>{customer.customer_name}</TableCell>
                    <TableCell>{customer.invoice_count}</TableCell>
                    <TableCell className="font-medium">KWD {customer.total_outstanding.toFixed(3)}</TableCell>
                    <TableCell>{format(new Date(customer.oldest_invoice_date), 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Customer Filter */}
            <div>
              <label className="text-sm font-medium">Customer</label>
              <Select 
                value={filters.customerId || 'all'} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  customerId: value === 'all' ? undefined : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker
                date={filters.startDate}
                onDateChange={(date) => setFilters(prev => ({ ...prev, startDate: date || undefined }))}
                placeholder="Select start date"
              />
            </div>

            <div>
              <label className="text-sm font-medium">End Date</label>
              <DatePicker
                date={filters.endDate}
                onDateChange={(date) => setFilters(prev => ({ ...prev, endDate: date || undefined }))}
                placeholder="Select end date"
              />
            </div>

            {/* Search */}
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Invoice ID, customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Minimum Amount (KWD)</label>
              <Input
                type="number"
                placeholder="0.000"
                value={minAmountFilter}
                onChange={(e) => setMinAmountFilter(e.target.value)}
                step="0.001"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <Button 
            variant="outline" 
            onClick={() => {
              setFilters({});
              setSearchTerm('');
              setMinAmountFilter('');
            }}
            className="w-full md:w-auto"
          >
            Clear All Filters
          </Button>
        </CardContent>
      </Card>

      {/* Outstanding Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Outstanding Invoices ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No outstanding invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoice Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Aging</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.invoice_id}>
                      <TableCell className="font-medium">{invoice.invoice_id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.customer_name}</p>
                          <p className="text-sm text-gray-500">{invoice.customer_code}</p>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>KWD {invoice.total_amount.toFixed(3)}</TableCell>
                      <TableCell>KWD {invoice.paid_amount.toFixed(3)}</TableCell>
                      <TableCell className="font-medium">KWD {invoice.outstanding_amount.toFixed(3)}</TableCell>
                      <TableCell>
                        <span className={invoice.days_overdue > 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {invoice.days_overdue}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAgingColor(invoice.aging_bucket)}>
                          {invoice.aging_bucket}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.payment_status)}>
                          {invoice.payment_status.replace('_', ' ')}
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
    </div>
  );
};

export default OutstandingInvoicesReport;
