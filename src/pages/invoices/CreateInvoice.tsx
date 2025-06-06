import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useCreateInvoice } from '@/hooks/useInvoices';

interface Item {
  product_id: string;
  quantity: number;
  price: number;
  total: number;
}

const CreateInvoice = () => {
  const router = useRouter();
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(addDays(new Date(), 30));
  const [items, setItems] = useState<Item[]>([{ product_id: '', quantity: 1, price: 0, total: 0 }]);
  const [notes, setNotes] = useState('');
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);

  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();
  const createInvoice = useCreateInvoice();

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + item.total, 0);
  };

  const subtotal = calculateSubtotal();
  const total = subtotal + tax - discount;

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // If product_id is updated, fetch the product and update the price
    if (field === 'product_id') {
      const product = products.find((p) => p.id === value);
      newItems[index].price = product?.base_price || 0;
    }

    // Recalculate total
    newItems[index].total = newItems[index].quantity * newItems[index].price;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    const invoiceData = {
      customer_id: customerId,
      date: date ? format(date, 'yyyy-MM-dd') : '',
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : '',
      subtotal: subtotal,
      tax: tax,
      discount: discount,
      total: total,
      status: 'unpaid',
      notes: notes,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      }))
    };

    try {
      await createInvoice.mutateAsync(invoiceData);
      router.push('/invoices/InvoicesList');
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
            <Select id="customer" value={customerId} onValueChange={setCustomerId}>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a due date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Items */}
          <div>
            <Label>Items</Label>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 py-2 border-b">
                {/* Product Select */}
                <div className="col-span-2">
                  <Select value={item.product_id} onValueChange={(value) => updateItem(index, 'product_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity Input */}
                <div>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                  />
                </div>

                {/* Price Display */}
                <div>
                  <Input
                    type="number"
                    value={item.price}
                    readOnly
                  />
                </div>

                {/* Remove Button */}
                <div>
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {/* Tax and Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tax">Tax</Label>
              <Input
                type="number"
                id="tax"
                value={tax}
                onChange={(e) => setTax(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="discount">Discount</Label>
              <Input
                type="number"
                id="discount"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Subtotal and Total */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Subtotal</Label>
              <Input type="number" value={subtotal} readOnly />
            </div>
            <div>
              <Label>Total</Label>
              <Input type="number" value={total} readOnly />
            </div>
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} disabled={createInvoice.isPending}>
            {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateInvoice;
