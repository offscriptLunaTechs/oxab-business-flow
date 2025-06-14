
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Trash2, Search, ArrowLeft, Package } from 'lucide-react';
import { addDays } from 'date-fns';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types/invoice';
import { ProductSelectionModal } from '@/components/invoices/ProductSelectionModal';

interface Item {
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  product_name?: string;
  product_size?: string;
  product_sku?: string;
}

const MobileInvoiceForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(addDays(new Date(), 30));
  const [items, setItems] = useState<Item[]>([]);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isFreeOfCharge, setIsFreeOfCharge] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const { data: products = [] } = useProducts(searchTerm);
  const { data: customers = [] } = useCustomers();
  const createInvoice = useCreateInvoice();

  // Show some default products when no search term
  const displayProducts = searchTerm ? 
    products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : 
    products.slice(0, 6); // Show first 6 products by default

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
      console.warn('Failed to fetch customer price:', error);
      return null;
    }
  };

  // Update item prices when customer changes
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

  const addProductFromSearch = async (product: Product) => {
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

  const addItemFromModal = async (product: Product) => {
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
    setItems(prevItems => [...prevItems, newItem]);
    setSearchTerm(''); 
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, quantity);
    newItems[index].total = newItems[index].quantity * newItems[index].price;
    setItems(newItems);
  };

  const updateItemPrice = (index: number, price: number) => {
    const newItems = [...items];
    newItems[index].price = Math.max(0, price);
    newItems[index].total = newItems[index].quantity * newItems[index].price;
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/invoices')}
              className="mr-3 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Create Invoice</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Customer Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="h-12 text-base">
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
          </CardContent>
        </Card>

        {/* Product Search & Add */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Add Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Browse */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsProductModalOpen(true)} 
                className="h-12 px-4"
              >
                <Package className="h-5 w-5 mr-2" /> 
                Browse
              </Button>
            </div>

            {/* Product Results */}
            {displayProducts.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {displayProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => addProductFromSearch(product)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-600">SKU: {product.sku} • Size: {product.size}</div>
                      <div className="text-sm font-medium text-blue-600">KWD {product.base_price.toFixed(3)}</div>
                    </div>
                    <Button size="sm" variant="ghost" className="p-2">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchTerm && displayProducts.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No products found. Try browsing or different search terms.</p>
            )}
          </CardContent>
        </Card>

        {/* Selected Items */}
        {items.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Selected Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    {/* Product Info */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.product_name}</div>
                        <div className="text-xs text-gray-600">SKU: {item.product_sku}</div>
                        <div className="text-xs text-gray-600">Size: {item.product_size}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Quantity and Price Controls */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                          min="1"
                          className="h-10 text-center text-base"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Price</Label>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                          step="0.001"
                          min="0"
                          className="h-10 text-center text-base"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Total</Label>
                        <div className="h-10 px-3 py-2 bg-white border rounded-md flex items-center justify-center text-base font-medium">
                          {item.total.toFixed(3)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Invoice Date</Label>
                <DatePicker
                  date={date}
                  onDateChange={setDate}
                  placeholder="Pick invoice date"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Due Date</Label>
                <DatePicker
                  date={dueDate}
                  onDateChange={setDueDate}
                  placeholder="Pick due date"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                className="h-12 text-base"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="free-of-charge"
                checked={isFreeOfCharge}
                onCheckedChange={(checked) => setIsFreeOfCharge(checked === true)}
              />
              <Label htmlFor="free-of-charge" className="text-sm font-medium">
                Mark as Free of Charge
              </Label>
            </div>

            <div>
              <Label htmlFor="discount" className="text-sm font-medium">Discount Amount</Label>
              <Input
                type="number"
                id="discount"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                disabled={isFreeOfCharge}
                step="0.001"
                className="h-12 text-base"
                placeholder="0.000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-base">
                <span>Subtotal</span>
                <span>KWD {subtotal.toFixed(3)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-base">
                  <span>Discount</span>
                  <span>-KWD {discount.toFixed(3)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-3">
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

      {/* Fixed Bottom Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <Button
          onClick={handleSubmit}
          disabled={createInvoice.isPending || !customerId || items.length === 0}
          className="w-full h-14 text-lg font-medium"
        >
          {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
        </Button>
      </div>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelectProduct={addItemFromModal}
      />
    </div>
  );
};

export default MobileInvoiceForm;
