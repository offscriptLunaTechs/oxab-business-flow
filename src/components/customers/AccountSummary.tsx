
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { format, subDays } from 'date-fns';
import { 
  CalendarIcon, 
  Download, 
  Printer, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Mail,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerStatement } from '@/hooks/useCustomerStatement';
import { useUpdateInvoice } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CustomerStatementPDF from './CustomerStatementPDF';

export const AccountSummary = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { data: customers = [] } = useCustomers();
  const statementData = useCustomerStatement(selectedCustomerId, startDate, endDate);
  const updateInvoiceMutation = useUpdateInvoice();
  const { toast } = useToast();

  const getStatusBadge = (invoice: any) => {
    if (invoice.status === 'paid') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    }
    
    if (invoice.isOverdue) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <AlertCircle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      await updateInvoiceMutation.mutateAsync({
        invoiceId,
        invoiceData: { status: 'paid' }
      });
      toast({
        title: "Success",
        description: "Invoice marked as paid successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark invoice as paid",
        variant: "destructive",
      });
    }
  };

  const handleEmailStatement = () => {
    // TODO: Implement email statement functionality
    toast({
      title: "Email Statement",
      description: "Email functionality will be implemented soon",
    });
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="space-y-6">
      {/* Customer Selection and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Statement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Customer</label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Search and select customer..." />
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

      {/* Customer Statement */}
      {selectedCustomer ? (
        <>
          {/* Statement Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCustomer.name} ({selectedCustomer.code})
                  </h2>
                  <p className="text-gray-600">
                    Period: {format(startDate, 'dd/MM/yyyy')} to {format(endDate, 'dd/MM/yyyy')}
                  </p>
                  {selectedCustomer.address && (
                    <p className="text-sm text-gray-500 mt-1">{selectedCustomer.address}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Opening Balance</div>
                  <div className="text-lg font-semibold">KWD {statementData.openingBalance.toFixed(3)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  KWD {statementData.totalOutstanding.toFixed(3)}
                </div>
                <p className="text-sm text-gray-600">Total Outstanding</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  KWD {statementData.totalPaid.toFixed(3)}
                </div>
                <p className="text-sm text-gray-600">Total Paid</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {statementData.invoices.length}
                </div>
                <p className="text-sm text-gray-600">Total Invoices</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {statementData.invoices.filter(inv => inv.isOverdue).length}
                </div>
                <p className="text-sm text-gray-600">Overdue Invoices</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {selectedCustomer && statementData.invoices.length > 0 && (
                  <PDFDownloadLink
                    document={
                      <CustomerStatementPDF
                        customer={selectedCustomer}
                        invoices={statementData.invoices}
                        startDate={startDate}
                        endDate={endDate}
                        totalOutstanding={statementData.totalOutstanding}
                        openingBalance={statementData.openingBalance}
                      />
                    }
                    fileName={`statement-${selectedCustomer.code}-${format(new Date(), 'yyyy-MM-dd')}.pdf`}
                  >
                    {({ loading }) => (
                      <Button disabled={loading} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        {loading ? 'Generating...' : 'Export PDF'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
                
                <Button 
                  onClick={handleEmailStatement} 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email Statement
                </Button>
                
                <Button 
                  onClick={() => window.print()} 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Statement
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoice List */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {statementData.invoices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No invoices found for the selected period</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Running Balance</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statementData.invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            {format(new Date(invoice.date), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {invoice.id}
                            </code>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              KWD {Number(invoice.total).toFixed(3)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(invoice)}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "font-medium",
                              invoice.runningBalance > 0 ? "text-red-600" : "text-green-600"
                            )}>
                              KWD {Number(invoice.runningBalance).toFixed(3)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              invoice.isOverdue ? "text-red-600 font-medium" : "text-gray-600"
                            )}>
                              {format(new Date(invoice.due_date), "dd/MM/yyyy")}
                            </span>
                          </TableCell>
                          <TableCell>
                            {invoice.status !== 'paid' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsPaid(invoice.id)}
                                className="flex items-center gap-1"
                                disabled={updateInvoiceMutation.isPending}
                              >
                                <CreditCard className="h-3 w-3" />
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
        </>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-gray-500">Please select a customer to view their statement</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
