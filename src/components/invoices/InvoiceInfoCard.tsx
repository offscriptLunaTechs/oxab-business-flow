
import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface InvoiceInfoCardProps {
  invoice: {
    id: string;
    date: string;
    due_date: string;
    status: string;
    total: number;
    subtotal: number;
    discount: number;
    tax: number;
    notes?: string;
  };
}

const InvoiceInfoCard = ({ invoice }: InvoiceInfoCardProps) => {
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Invoice Details
        </CardTitle>
      </CardHeader>
      <CardContent className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <div>
          <label className="text-sm font-medium text-gray-600">Invoice Date</label>
          <p className="font-semibold">{format(new Date(invoice.date), 'MMM dd, yyyy')}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Due Date</label>
          <p className="font-semibold">{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Status</label>
          <div className="mt-1">
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Total Amount</label>
          <p className="text-2xl font-bold text-green-600">KD {Number(invoice.total).toFixed(3)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceInfoCard;
