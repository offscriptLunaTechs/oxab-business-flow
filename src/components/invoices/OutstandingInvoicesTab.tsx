
import React from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { OutstandingInvoice } from '@/hooks/useOutstandingInvoices';

interface OutstandingInvoicesTabProps {
  outstandingInvoices: OutstandingInvoice[];
  isLoading: boolean;
  isPDFGenerating: boolean;
  onDownloadReport: () => void;
}

const OutstandingInvoicesTab = ({
  outstandingInvoices,
  isLoading,
  isPDFGenerating,
  onDownloadReport,
}: OutstandingInvoicesTabProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Outstanding Invoices
          </CardTitle>
          <Button 
            onClick={onDownloadReport}
            disabled={isPDFGenerating}
            variant="outline"
          >
            {isPDFGenerating ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
  );
};

export default OutstandingInvoicesTab;
