
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Download, Printer, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';

interface AccountSummaryProps {}

export const AccountSummary = ({}: AccountSummaryProps) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const { data: customers = [] } = useCustomers();
  const { data: allInvoices = [] } = useInvoices();

  // Filter invoices by selected customer and date range
  const filteredInvoices = allInvoices.filter(invoice => {
    if (selectedCustomerId && invoice.customer_id !== selectedCustomerId) return false;
    if (startDate && new Date(invoice.date) < startDate) return false;
    if (endDate && new Date(invoice.date) > endDate) return false;
    return true;
  });

  // Calculate running balance and totals
  let runningBalance = 0;
  const invoicesWithBalance = filteredInvoices.map(invoice => {
    const invoiceAmount = invoice.status === 'paid' ? 0 : invoice.total;
    runningBalance += invoiceAmount;
    return {
      ...invoice,
      runningBalance
    };
  });

  const totalOutstanding = filteredInvoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== 'paid';
    
    if (status === 'paid') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    }
    
    if (isOverdue) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    // TODO: Implement mark as paid functionality
    console.log('Mark as paid:', invoiceId);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Export PDF for customer:', selectedCustomerId);
  };

  const handlePrintStatement = () => {
    // TODO: Implement print statement
    console.log('Print statement for customer:', selectedCustomerId);
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="space-y-6">
      {/* Customer Selection and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Customer</label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {selectedCustomer && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                ${totalOutstanding.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600">Total Outstanding</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {filteredInvoices.length}
              </div>
              <p className="text-sm text-gray-600">Total Invoices</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {filteredInvoices.filter(inv => inv.status === 'paid').length}
              </div>
              <p className="text-sm text-gray-600">Paid Invoices</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredInvoices.filter(inv => inv.status !== 'paid').length}
              </div>
              <p className="text-sm text-gray-600">Pending Invoices</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      {selectedCustomer && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleExportPDF} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Button onClick={handlePrintStatement} variant="outline" className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print Statement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice List */}
      {selectedCustomer ? (
        <Card>
          <CardHeader>
            <CardTitle>
              Account Statement - {selectedCustomer.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoicesWithBalance.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No invoices found for the selected criteria</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Running Balance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesWithBalance.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {invoice.id}
                          </code>
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.date), "PP")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.due_date), "PP")}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            ${invoice.total.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invoice.status, invoice.due_date)}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "font-medium",
                            invoice.runningBalance > 0 ? "text-red-600" : "text-green-600"
                          )}>
                            ${invoice.runningBalance.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {invoice.status !== 'paid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Mark Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-gray-500">Please select a customer to view their account summary</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
