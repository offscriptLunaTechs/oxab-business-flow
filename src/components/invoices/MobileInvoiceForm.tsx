
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Trash2, Search, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { addDays } from 'date-fns';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types/invoice';

interface Item {
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  product_name?: string;
  product_size?: string;
  product_sku?: string;
}

type Step = 'customer' | 'items' | 'details' | 'review';

const MobileInvoiceForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('customer');
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(addDays(new Date(), 30));
  const [items, setItems] = useState<Item[]>([]);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isFreeOfCharge, setIsFreeOfCharge] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();
  const createInvoice = useCreateInvoice();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerPrice = async (customerId: string, productId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_pricing')
        .select('price')
        .eq('customer_id', customerId)
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('effective_date', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;
      return data.price;
    } catch (error) {
      return null;
    }
  };

  const addProduct = async (product: Product) => {
    let price = product.base_price;
    
    if (customerId) {
      const customerPrice = await getCustomerPrice(customerId, product.id);
      if (customerPrice !== null) {
        price = customerPrice;
      }
    }

    const newItem: Item = {
      product_id: product.id,
      quantity: 1,
      price: price,
      total: price,
      product_name: product.name,
      product_size: product.size,
      product_sku: product.sku,
    };
    setItems([...items, newItem]);
    setSearchTerm('');
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    newItems[index].total = quantity * newItems[index].price;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + item.total, 0);
  };

  const subtotal = calculateSubtotal();
  const total = isFreeOfCharge ? 0 : subtotal - discount;

  const handleSubmit = async () => {
    if (!customerId || items.length === 0) {
      toast({
        title: "Error",
        description: "Customer and items are required",
        variant: "destructive",
      });
      return;
    }

    const invoiceData = {
      customer_id: customerId,
      date: date ? date.toISOString().split('T')[0] : '',
      due_date: dueDate ? dueDate.toISOString().split('T')[0] : '',
      subtotal: subtotal,
      tax: 0,
      discount: discount,
      total: total,
      status: 'pending',
      notes: isFreeOfCharge ? `${notes}\n[FREE OF CHARGE]`.trim() : notes,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: isFreeOfCharge ? 0 : item.price,
        total: isFreeOfCharge ? 0 : item.total
      }))
    };

    try {
      const result = await createInvoice.mutateAsync(invoiceData);
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      navigate(`/invoices/${result.id}`);
    } catch (error) {
      console.error('Failed to create invoice', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'customer':
        return customerId !== '';
      case 'items':
        return items.length > 0;
      case 'details':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'customer', label: 'Customer' },
      { key: 'items', label: 'Items' },
      { key: 'details', label: 'Details' },
      { key: 'review', label: 'Review' }
    ];

    return (
      <div className="flex justify-between mb-6">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step.key
                  ? 'bg-blue-600 text-white'
                  : steps.findIndex(s => s.key === currentStep) > index
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {steps.findIndex(s => s.key === currentStep) > index ? (
                <Check className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className="flex-1 h-px bg-gray-200 mx-4 hidden sm:block" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCustomerStep = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="customer" className="text-lg font-medium">Select Customer</Label>
        <p className="text-sm text-gray-600 mb-4">Choose the customer for this invoice</p>
        <Select value={customerId} onValueChange={setCustomerId}>
          <SelectTrigger className="h-12 text-lg">
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id} className="py-3">
                <div>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.code}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderItemsStep = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-medium">Add Products</Label>
        <p className="text-sm text-gray-600 mb-4">Search and add products to the invoice</p>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>

        {searchTerm && (
          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                onClick={() => addProduct(product)}
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-600">SKU: {product.sku} | Size: {product.size}</div>
                <div className="text-sm font-medium text-blue-600">KWD {product.base_price.toFixed(3)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div>
          <Label className="text-lg font-medium">Selected Items ({items.length})</Label>
          <div className="space-y-3 mt-4">
            {items.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-sm text-gray-600">SKU: {item.product_sku}</div>
                    <div className="text-sm text-gray-600">Size: {item.product_size}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label className="text-sm">Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                      min="1"
                      className="h-10"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm">Price</Label>
                    <div className="h-10 px-3 py-2 bg-gray-50 border rounded-md flex items-center">
                      KWD {item.price.toFixed(3)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm">Total</Label>
                    <div className="h-10 px-3 py-2 bg-gray-50 border rounded-md flex items-center font-medium">
                      KWD {item.total.toFixed(3)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-medium">Invoice Details</Label>
        <p className="text-sm text-gray-600 mb-4">Set dates and additional options</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <Label className="text-base font-medium">Invoice Date</Label>
          <DatePicker
            date={date}
            onDateChange={setDate}
            placeholder="Pick invoice date"
          />
        </div>
        
        <div>
          <Label className="text-base font-medium">Due Date</Label>
          <DatePicker
            date={dueDate}
            onDateChange={setDueDate}
            placeholder="Pick due date"
          />
        </div>

        <div>
          <Label htmlFor="notes" className="text-base font-medium">Notes</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes..."
            className="h-12"
          />
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox
            id="free-of-charge"
            checked={isFreeOfCharge}
            onCheckedChange={(checked) => setIsFreeOfCharge(checked === true)}
          />
          <Label htmlFor="free-of-charge" className="text-base font-medium">
            Mark as Free of Charge
          </Label>
        </div>

        <div>
          <Label htmlFor="discount" className="text-base font-medium">Discount Amount</Label>
          <Input
            type="number"
            id="discount"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            disabled={isFreeOfCharge}
            step="0.001"
            className="h-12"
            placeholder="0.000"
          />
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-medium">Review Invoice</Label>
        <p className="text-sm text-gray-600 mb-4">Review all details before creating the invoice</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.find(c => c.id === customerId)?.name}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <div className="font-medium">{item.product_name}</div>
                  <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">KWD {item.total.toFixed(3)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>KWD {subtotal.toFixed(3)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-KWD {discount.toFixed(3)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-lg border-t pt-2">
              <span>Total</span>
              <span className={isFreeOfCharge ? 'text-green-600' : ''}>
                KWD {total.toFixed(3)}
                {isFreeOfCharge && ' (FREE)'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'customer':
        return renderCustomerStep();
      case 'items':
        return renderItemsStep();
      case 'details':
        return renderDetailsStep();
      case 'review':
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/invoices')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Create Invoice</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            {renderStepIndicator()}
            {renderStepContent()}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6 space-x-4">
          <Button
            variant="outline"
            onClick={() => {
              const steps: Step[] = ['customer', 'items', 'details', 'review'];
              const currentIndex = steps.indexOf(currentStep);
              if (currentIndex > 0) {
                setCurrentStep(steps[currentIndex - 1]);
              }
            }}
            disabled={currentStep === 'customer'}
            className="flex-1 h-12"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>

          {currentStep === 'review' ? (
            <Button
              onClick={handleSubmit}
              disabled={createInvoice.isPending || !canProceedToNext()}
              className="flex-1 h-12"
            >
              {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
            </Button>
          ) : (
            <Button
              onClick={() => {
                const steps: Step[] = ['customer', 'items', 'details', 'review'];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex < steps.length - 1) {
                  setCurrentStep(steps[currentIndex + 1]);
                }
              }}
              disabled={!canProceedToNext()}
              className="flex-1 h-12"
            >
              Next
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileInvoiceForm;
