import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Trash2, Search } from 'lucide-react';
import { addDays } from 'date-fns';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerProductPrice } from '@/hooks/useCustomerPricing';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { ProductSelectionModal } from '@/components/invoices/ProductSelectionModal';
import { Product } from '@/types/invoice';
import { supabase } from '@/integrations/supabase/client';

interface Item {
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  product_name?: string;
  product_size?: string;
  product_sku?: string;
}

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(addDays(new Date(), 30));
  const [items, setItems] = useState<Item[]>([]);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isFreeOfCharge, setIsFreeOfCharge] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();
  const createInvoice = useCreateInvoice();

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + item.total, 0);
  };

  const subtotal = calculateSubtotal();
  const total = isFreeOfCharge ? 0 : subtotal - discount;

  // Function to get customer price for a product
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

      if (error || !data) {
        return null;
      }
      
      return data.price;
    } catch (error) {
      console.warn('Failed to fetch customer price:', error);
      return null;
    }
  };

  // Update all item prices when customer changes
  useEffect(() => {
    if (customerId && items.length > 0) {
      const updateAllItemPrices = async () => {
        const updatedItems = await Promise.all(
          items.map(async (item) => {
            const customerPrice = await getCustomerPrice(customerId, item.product_id);
            if (customerPrice !== null) {
              return {
                ...item,
                price: customerPrice,
                total: customerPrice * item.quantity
              };
            }
            return item;
          })
        );
        setItems(updatedItems);
      };
      updateAllItemPrices();
    }
  }, [customerId]);

  const addItemFromModal = async (product: Product) => {
    let price = product.base_price;
    
    // Try to get customer-specific price if customer is selected
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
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = async (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // If product_id is updated, fetch the product and update the details
    if (field === 'product_id') {
      const product = products.find((p) => p.id === value);
      if (product) {
        let price = product.base_price;
        
        // Try to get customer-specific price
        if (customerId) {
          const customerPrice = await getCustomerPrice(customerId, value);
          if (customerPrice !== null) {
            price = customerPrice;
          }
        }
        
        newItems[index].price = price;
        newItems[index].product_name = product.name;
        newItems[index].product_size = product.size;
        newItems[index].product_sku = product.sku;
      }
    }

    // Recalculate total
    newItems[index].total = newItems[index].quantity * newItems[index].price;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!customerId || items.length === 0) {
      console.error('Customer and items are required');
      return;
    }

    const invoiceData = {
      customer_id: customerId,
      date: date ? date.toISOString().split('T')[0] : '',
      due_date: dueDate ? dueDate.toISOString().split('T')[0] : '',
      subtotal: subtotal,
      tax: 0, // No tax in Kuwait
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
      await createInvoice.mutateAsync(invoiceData);
      navigate('/invoices');
    } catch (error) {
      console.error('Failed to create invoice', error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Invoice</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Customer Selection */}
          <div>
            <Label htmlFor="customer">Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <DatePicker
                date={date}
                onDateChange={setDate}
                placeholder="Pick invoice date"
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <DatePicker
                date={dueDate}
                onDateChange={setDueDate}
                placeholder="Pick due date"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Items</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setIsProductModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Browse Products</span>
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">No items added yet</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsProductModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 py-3 px-4 border rounded-lg bg-gray-50">
                    <div className="col-span-5">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{item.product_name}</p>
                        <p className="text-xs text-gray-600">SKU: {item.product_sku}</p>
                        <p className="text-xs text-gray-600">Size: {item.product_size}</p>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="h-8"
                        min="1"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Price</Label>
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        className="h-8"
                        step="0.01"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Total</Label>
                      <Input
                        type="number"
                        value={item.total.toFixed(2)}
                        readOnly
                        className="h-8 bg-gray-100"
                      />
                    </div>

                    <div className="col-span-1 flex items-end">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeItem(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsProductModalOpen(true)}
                  className="w-full mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Item
                </Button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {/* Free of Charge and Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="free-of-charge"
                checked={isFreeOfCharge}
                onCheckedChange={(checked) => setIsFreeOfCharge(checked === true)}
              />
              <Label htmlFor="free-of-charge" className="text-sm font-medium">
                Free of Charge
              </Label>
            </div>
            <div>
              <Label htmlFor="discount">Discount</Label>
              <Input
                type="number"
                id="discount"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                disabled={isFreeOfCharge}
                step="0.01"
              />
            </div>
          </div>

          {/* Subtotal and Total */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label>Subtotal</Label>
              <Input type="number" value={subtotal.toFixed(2)} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Total</Label>
              <Input 
                type="number" 
                value={total.toFixed(2)} 
                readOnly 
                className={`bg-gray-50 ${isFreeOfCharge ? 'text-green-600 font-bold' : ''}`}
              />
              {isFreeOfCharge && (
                <p className="text-xs text-green-600 mt-1">This invoice is marked as free of charge</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={createInvoice.isPending || !customerId || items.length === 0}
            className="w-full"
          >
            {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
        </CardContent>
      </Card>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelectProduct={addItemFromModal}
      />
    </div>
  );
};

export default CreateInvoice;
