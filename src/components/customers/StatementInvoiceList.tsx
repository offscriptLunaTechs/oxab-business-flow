
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { CheckCircle, AlertCircle, Clock, CreditCard, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateInvoice } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';

interface StatementInvoiceListProps {
  invoices: any[];
}

export const StatementInvoiceList: React.FC<StatementInvoiceListProps> = ({ invoices }) => {
  const updateInvoiceMutation = useUpdateInvoice();
  const { toast } = useToast();

  const getStatusBadge = (invoice: any) => {
    switch (invoice.payment_status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case 'partially_paid':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <DollarSign className="h-3 w-3 mr-1" />
            Paid Partially
          </Badge>
        );
      case 'overdue':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
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
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
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
                      <span className="font-medium text-green-600">
                        KWD {Number(invoice.allocated_amount || 0).toFixed(3)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-medium",
                        invoice.outstanding_amount > 0 ? "text-red-600" : "text-green-600"
                      )}>
                        KWD {Number(invoice.outstanding_amount || 0).toFixed(3)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice)}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        invoice.isOverdue ? "text-red-600 font-medium" : "text-gray-600"
                      )}>
                        {format(new Date(invoice.due_date), "dd/MM/yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {invoice.payment_status !== 'paid' && (
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
  );
};
