import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Edit, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { getStatusColor } from '@/utils/invoiceUtils';
import { useUpdateInvoice } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileInvoiceCard from './MobileInvoiceCard';

interface Invoice {
  id: string;
  customers?: { name: string };
  date: string;
  due_date: string;
  status: string;
  total: number;
}

interface AllInvoicesTabProps {
  filteredInvoices: Invoice[];
  isLoading: boolean;
  downloadingInvoiceId: string | null;
  onDownloadInvoicePDF: (invoiceId: string) => void;
}

const AllInvoicesTab = ({
  filteredInvoices,
  isLoading,
  downloadingInvoiceId,
  onDownloadInvoicePDF,
}: AllInvoicesTabProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const updateInvoiceMutation = useUpdateInvoice();

  const handleStatusUpdate = async (invoiceId: string, newStatus: string) => {
    try {
      await updateInvoiceMutation.mutateAsync({
        invoiceId,
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
      <Card>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (filteredInvoices.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No invoices found</p>
          <p className="text-sm text-gray-500 mt-2">
            Try adjusting your search terms or filters
          </p>
        </CardContent>
      </Card>
    );
  }

  // Mobile view with cards
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5" />
          <h3 className="text-lg font-semibold">All Invoices ({filteredInvoices.length})</h3>
        </div>
        
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => (
            <MobileInvoiceCard
              key={invoice.id}
              invoice={invoice}
              isDownloading={downloadingInvoiceId === invoice.id}
              onView={(id) => navigate(`/invoices/${id}`)}
              onEdit={(id) => navigate(`/invoices/${id}/edit`)}
              onDownload={onDownloadInvoicePDF}
              onStatusUpdate={handleStatusUpdate}
              isUpdating={updateInvoiceMutation.isPending}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop view with table
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          All Invoices ({filteredInvoices.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                  <TableCell>
                    {format(new Date(invoice.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                  </TableCell>
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
                        onClick={() => onDownloadInvoicePDF(invoice.id)}
                        disabled={downloadingInvoiceId === invoice.id}
                      >
                        {downloadingInvoiceId === invoice.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(invoice.id, 'draft')}
                            disabled={updateInvoiceMutation.isPending}
                          >
                            Mark as Draft
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(invoice.id, 'pending')}
                            disabled={updateInvoiceMutation.isPending}
                          >
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(invoice.id, 'paid')}
                            disabled={updateInvoiceMutation.isPending}
                          >
                            Mark as Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(invoice.id, 'overdue')}
                            disabled={updateInvoiceMutation.isPending}
                          >
                            Mark as Overdue
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllInvoicesTab;
