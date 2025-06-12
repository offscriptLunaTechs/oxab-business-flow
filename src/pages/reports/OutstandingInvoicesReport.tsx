
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Filter, Eye, Calendar, DollarSign, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useOutstandingInvoices, OutstandingInvoicesFilters } from '@/hooks/useOutstandingInvoices';
import { format } from 'date-fns';

const OutstandingInvoicesReport = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<OutstandingInvoicesFilters>({});
  const [minAmountInput, setMinAmountInput] = useState('');

  const { data: invoices = [], isLoading, error, refetch } = useOutstandingInvoices(filters);

  const handleFilterChange = (key: keyof OutstandingInvoicesFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMinAmountChange = (value: string) => {
    setMinAmountInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      handleFilterChange('minAmount', numValue);
    } else if (value === '') {
      handleFilterChange('minAmount', undefined);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setMinAmountInput('');
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgingBucketColor = (bucket: string) => {
    switch (bucket) {
      case 'Current': return 'bg-green-100 text-green-800';
      case '1-30 Days': return 'bg-yellow-100 text-yellow-800';
      case '31-60 Days': return 'bg-orange-100 text-orange-800';
      case '61-90 Days': return 'bg-red-100 text-red-800';
      case '90+ Days': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate summary statistics
  const summary = invoices.reduce((acc, invoice) => {
    acc.totalOutstanding += invoice.outstanding_amount;
    acc.totalInvoices += 1;
    
    if (invoice.days_overdue > 0) {
      acc.overdueAmount += invoice.outstanding_amount;
      acc.overdueCount += 1;
    }
    
    // Age bucket counts
    switch (invoice.aging_bucket) {
      case 'Current': acc.current += 1; break;
      case '1-30 Days': acc.days30 += 1; break;
      case '31-60 Days': acc.days60 += 1; break;
      case '61-90 Days': acc.days90 += 1; break;
      case '90+ Days': acc.days90Plus += 1; break;
    }
    
    return acc;
  }, {
    totalOutstanding: 0,
    totalInvoices: 0,
    overdueAmount: 0,
    overdueCount: 0,
    current: 0,
    days30: 0,
    days60: 0,
    days90: 0,
    days90Plus: 0,
  });

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/invoices')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Outstanding Invoices Report</h1>
              <p className="text-gray-600">Track all unpaid and partially paid invoices</p>
            </div>
          </div>
        </div>

        {/* Error State */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Report</h3>
              <p className="text-gray-600 mb-4">
                {error.message || 'Failed to load outstanding invoices report'}
              </p>
              <Button onClick={() => refetch()} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/invoices')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Outstanding Invoices Report</h1>
            <p className="text-gray-600">Track all unpaid and partially paid invoices</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-600">KD {summary.totalOutstanding.toFixed(3)}</p>
                <p className="text-sm text-gray-500">{summary.totalInvoices} invoices</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                <p className="text-2xl font-bold text-red-600">KD {summary.overdueAmount.toFixed(3)}</p>
                <p className="text-sm text-gray-500">{summary.overdueCount} overdue</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current (Not Due)</p>
                <p className="text-2xl font-bold text-green-600">{summary.current}</p>
                <p className="text-sm text-gray-500">invoices</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">90+ Days Overdue</p>
                <p className="text-2xl font-bold text-red-600">{summary.days90Plus}</p>
                <p className="text-sm text-gray-500">critical</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
              <DatePicker
                date={filters.startDate}
                onDateChange={(date) => handleFilterChange('startDate', date)}
                placeholder="Select start date"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
              <DatePicker
                date={filters.endDate}
                onDateChange={(date) => handleFilterChange('endDate', date)}
                placeholder="Select end date"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Min Amount (KD)</label>
              <Input
                type="number"
                step="0.001"
                placeholder="0.000"
                value={minAmountInput}
                onChange={(e) => handleMinAmountChange(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Invoices ({invoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No outstanding invoices found</p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your filters or check back later
              </p>
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
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Aging</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
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
                      <TableCell>KD {invoice.total_amount.toFixed(3)}</TableCell>
                      <TableCell>KD {invoice.paid_amount.toFixed(3)}</TableCell>
                      <TableCell className="font-medium text-red-600">
                        KD {invoice.outstanding_amount.toFixed(3)}
                      </TableCell>
                      <TableCell>
                        {invoice.days_overdue > 0 ? (
                          <span className="text-red-600 font-medium">{invoice.days_overdue}</span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getAgingBucketColor(invoice.aging_bucket)}>
                          {invoice.aging_bucket}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(invoice.payment_status)}>
                          {invoice.payment_status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/invoices/${invoice.invoice_id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
