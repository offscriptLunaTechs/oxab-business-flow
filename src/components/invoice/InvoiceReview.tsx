import React, { useState } from 'react';
import { FileText, Download, User, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/types/invoice';
import { InvoiceItem } from './ProductSelection';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface InvoiceReviewProps {
  customer: Customer;
  items: InvoiceItem[];
  onBack: () => void;
  onComplete: (invoiceId: string) => void;
}

const InvoiceReview: React.FC<InvoiceReviewProps> = ({
  customer,
  items,
  onBack,
  onComplete,
}) => {
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days from now
    return date.toISOString().split('T')[0];
  });

  const { mutate: createInvoice, isPending } = useCreateInvoice();
  const { toast } = useToast();

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * tax) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const handleSubmit = () => {
    const invoiceData = {
      customer_id: customer.id,
      date: new Date().toISOString().split('T')[0],
      due_date: dueDate,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      status: 'pending' as const,
      notes: notes || undefined,
      items: items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
    };

    createInvoice(invoiceData, {
      onSuccess: (invoice) => {
        toast({
          title: "Success",
          description: `Invoice ${invoice.id} created successfully!`,
        });
        onComplete(invoice.id);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
        <p className="text-gray-600">Review invoice details before creating</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Customer & Invoice Details */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">Customer Name</Label>
                <p className="font-semibold">{customer.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Customer Code</Label>
                <p>{customer.code}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Type</Label>
                <Badge variant={customer.customer_type === 'wholesale' ? 'default' : 'secondary'}>
                  {customer.customer_type.charAt(0).toUpperCase() + customer.customer_type.slice(1)}
                </Badge>
              </div>
              {customer.email && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p>{customer.email}</p>
                </div>
              )}
              {customer.phone && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p>{customer.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  min="0"
                  max="100"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="tax">Tax (%)</Label>
                <Input
                  id="tax"
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  min="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items & Totals */}
        <div className="space-y-6">
          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × KD {item.price.toFixed(3)}
                      </p>
                      {item.product.is_low_stock && (
                        <div className="flex items-center mt-1">
                          <AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />
                          <span className="text-xs text-orange-600">Low Stock Warning</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">KD {item.total.toFixed(3)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>KD {subtotal.toFixed(3)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({discount}%):</span>
                  <span>-KD {discountAmount.toFixed(3)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({tax}%):</span>
                  <span>KD {taxAmount.toFixed(3)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>KD {total.toFixed(3)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="px-8 py-3 text-lg h-auto"
          disabled={isPending}
        >
          Back: Edit Products
        </Button>
        <Button
          onClick={handleSubmit}
          size="lg"
          className="px-8 py-3 text-lg h-auto"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating Invoice...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5 mr-2" />
              Create Invoice
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default InvoiceReview;
