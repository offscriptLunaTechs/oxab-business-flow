
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoice, useUpdateInvoice, useDeleteInvoice } from '@/hooks/useInvoices';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const EditInvoice = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: invoice, isLoading, error } = useInvoice(id!);
  const { data: customers } = useCustomers();
  const { data: products } = useProducts();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const [formData, setFormData] = useState({
    customer_id: '',
    date: '',
    due_date: '',
    status: '',
    notes: '',
  });

  const [items, setItems] = useState<any[]>([]);

  React.useEffect(() => {
    if (invoice) {
      setFormData({
        customer_id: invoice.customer_id,
        date: invoice.date,
        due_date: invoice.due_date,
        status: invoice.status,
        notes: invoice.notes || '',
      });
      setItems(invoice.items || []);
    }
  }, [invoice]);

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'price') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].price;
    }
    
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, {
      product_id: '',
      quantity: 1,
      price: 0,
      total: 0,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax = subtotal * 0; // No tax for now
    const discount = 0; // No discount for now
    const total = subtotal + tax - discount;
    
    return { subtotal, tax, discount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoice) return;
    
    const { subtotal, tax, discount, total } = calculateTotals();
    
    try {
      await updateInvoice.mutateAsync({
        invoiceId: invoice.id,
        invoiceData: {
          ...formData,
          subtotal,
          tax,
          discount,
          total,
        },
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
      });
      
      navigate(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Failed to update invoice:', error);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;
    
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        await deleteInvoice.mutateAsync(invoice.id);
        navigate('/invoices');
      } catch (error) {
        console.error('Failed to delete invoice:', error);
      }
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

  const { subtotal, tax, discount, total } = calculateTotals();

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
            <h1 className="text-3xl font-bold text-gray-900">Edit Invoice {invoice.id}</h1>
            <p className="text-gray-600">Created on {format(new Date(invoice.created_at), 'MMM dd, yyyy')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteInvoice.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button
            type="submit"
            form="edit-invoice-form"
            disabled={updateInvoice.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <form id="edit-invoice-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Invoice Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoice Items</CardTitle>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-4">
                  <Label>Product</Label>
                  <Select
                    value={item.product_id}
                    onValueChange={(value) => {
                      const product = products?.find(p => p.id === value);
                      handleItemChange(index, 'product_id', value);
                      if (product) {
                        handleItemChange(index, 'price', product.base_price);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Total</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={item.total}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="col-span-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>KD {subtotal.toFixed(3)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-KD {discount.toFixed(3)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>KD {tax.toFixed(3)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>KD {total.toFixed(3)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditInvoice;
