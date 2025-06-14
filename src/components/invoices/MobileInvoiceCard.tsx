
import React from 'react';
import { Eye, Edit, Download, MoreHorizontal, Delete as DeleteIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { getStatusColor } from '@/utils/invoiceUtils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Invoice {
  id: string;
  customers?: { name: string };
  date: string;
  due_date: string;
  status: string;
  total: number;
}

interface MobileInvoiceCardProps {
  invoice: Invoice;
  isDownloading: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDownload: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  isUpdating: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const MobileInvoiceCard = ({
  invoice,
  isDownloading,
  onView,
  onEdit,
  onDownload,
  onStatusUpdate,
  isUpdating,
  onDelete,
  isDeleting,
}: MobileInvoiceCardProps) => {
  const isOverdue = invoice.status === 'overdue' || 
    (invoice.status === 'pending' && new Date(invoice.due_date) < new Date());

  return (
    <Card className={`mb-3 ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}>
      <CardContent className="p-4">
        {/* Header with invoice ID and status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">#{invoice.id}</span>
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onStatusUpdate(invoice.id, 'draft')}
                disabled={isUpdating}
              >
                Mark as Draft
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusUpdate(invoice.id, 'pending')}
                disabled={isUpdating}
              >
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusUpdate(invoice.id, 'paid')}
                disabled={isUpdating}
              >
                Mark as Paid
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusUpdate(invoice.id, 'overdue')}
                disabled={isUpdating}
              >
                Mark as Overdue
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onDelete &&
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete();
                  }}
                  disabled={isDeleting}
                  className="text-red-600"
                >
                  {isDeleting ? <LoadingSpinner size="sm" className="mr-2" /> : <DeleteIcon className="mr-2 h-4 w-4" />}
                  Delete Invoice
                </DropdownMenuItem>
              }
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Customer name */}
        <div className="mb-2">
          <span className="text-lg font-medium text-gray-900">
            {invoice.customers?.name || 'Unknown Customer'}
          </span>
        </div>
        <div className="mb-3">
          <span className="text-2xl font-bold text-green-600">
            KWD {Number(invoice.total).toFixed(3)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
          <div>
            <span className="block text-xs uppercase tracking-wide font-medium">Invoice Date</span>
            <span>{format(new Date(invoice.date), 'MMM dd, yyyy')}</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wide font-medium">Due Date</span>
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(invoice.id)}
            className="flex-1 flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(invoice.id)}
            className="flex-1 flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(invoice.id)}
            disabled={isDownloading}
            className="flex-1 flex items-center gap-2"
          >
            {isDownloading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileInvoiceCard;
