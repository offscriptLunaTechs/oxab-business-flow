
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Download, FileText, User, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInvoice } from '@/hooks/useInvoices';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { format } from 'date-fns';

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: invoice, isLoading, error } = useInvoice(id!);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          {error ? `Error loading invoice: ${error.message}` : 'Invoice not found'}
        </p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/invoices')} 
          className="mt-4"
        >
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.id}</h1>
            <p className="text-gray-600">Created on {format(new Date(invoice.created_at), 'MMM dd, yyyy')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Invoice Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
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

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-gray-500">{item.product?.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.product?.sku}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">KD {Number(item.price).toFixed(3)}</TableCell>
                      <TableCell className="text-right font-medium">KD {Number(item.total).toFixed(3)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Totals */}
              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>KD {Number(invoice.subtotal).toFixed(3)}</span>
                </div>
                {Number(invoice.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-KD {Number(invoice.discount).toFixed(3)}</span>
                  </div>
                )}
                {Number(invoice.tax) > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>KD {Number(invoice.tax).toFixed(3)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>KD {Number(invoice.total).toFixed(3)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Company Name</label>
                <p className="font-semibold">{invoice.customer?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Customer Code</label>
                <p>{invoice.customer?.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <Badge variant={invoice.customer?.customer_type === 'wholesale' ? 'default' : 'secondary'}>
                  {invoice.customer?.customer_type?.charAt(0).toUpperCase() + invoice.customer?.customer_type?.slice(1)}
                </Badge>
              </div>
              {invoice.customer?.email && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p>{invoice.customer.email}</p>
                </div>
              )}
              {invoice.customer?.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p>{invoice.customer.phone}</p>
                </div>
              )}
              {invoice.customer?.address && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p>{invoice.customer.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
