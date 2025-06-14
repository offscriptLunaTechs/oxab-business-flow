
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface InvoiceDetailHeaderProps {
  invoice: {
    id: string;
    status: string;
    created_at: string;
  };
  onStatusUpdate: (newStatus: string) => void;
  onDownloadPDF: () => void;
  isUpdating?: boolean;
}

const InvoiceDetailHeader = ({
  invoice,
  onStatusUpdate,
  onDownloadPDF,
  isUpdating = false,
}: InvoiceDetailHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Invoice {invoice.id}</h1>
          <p className="text-gray-600">Created on {format(new Date(invoice.created_at), 'MMM dd, yyyy')}</p>
        </div>
      </div>
      
      <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
        <Select value={invoice.status} onValueChange={onStatusUpdate} disabled={isUpdating}>
          <SelectTrigger className={isMobile ? 'w-full' : 'w-40'}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
          className={isMobile ? 'w-full' : ''}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button onClick={onDownloadPDF} className={isMobile ? 'w-full' : ''}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default InvoiceDetailHeader;
