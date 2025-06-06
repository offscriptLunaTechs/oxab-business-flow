
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const invoiceSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  date: z.string(),
  due_date: z.string(),
  subtotal: z.number(),
  tax: z.number(),
  discount: z.number(),
  total: z.number(),
  status: z.string(),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number(),
    price: z.number(),
    total: z.number(),
  })),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  initialValues?: Partial<InvoiceFormData>;
  onSubmit: (data: InvoiceFormData) => void;
  submitButtonLabel?: string;
}

export const InvoiceForm = ({ initialValues, onSubmit, submitButtonLabel = 'Submit' }: InvoiceFormProps) => {
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer_id: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      due_date: format(new Date(), 'yyyy-MM-dd'),
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      status: 'pending',
      notes: '',
      items: [{ product_id: '', quantity: 1, price: 0, total: 0 }],
      ...initialValues,
    },
  });

  const items = form.watch('items');

  const addItem = () => {
    const currentItems = form.getValues('items');
    form.setValue('items', [...currentItems, { product_id: '', quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues('items');
    form.setValue('items', currentItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const currentItems = form.getValues('items');
    currentItems[index][field] = value;

    if (field === 'product_id') {
      const product = products.find((p) => p.id === value);
      currentItems[index].price = product?.base_price || 0;
    }

    currentItems[index].total = currentItems[index].quantity * currentItems[index].price;
    form.setValue('items', currentItems);

    // Recalculate totals
    const subtotal = currentItems.reduce((acc, item) => acc + item.total, 0);
    form.setValue('subtotal', subtotal);
    form.setValue('total', subtotal + form.getValues('tax') - form.getValues('discount'));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <Label>Items</Label>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 py-2 border-b">
              <div className="col-span-2">
                <Select
                  value={item.product_id}
                  onValueChange={(value) => updateItem(index, 'product_id', value)}
                >
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

              <div>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Input
                  type="number"
                  value={item.price}
                  readOnly
                />
              </div>

              <div>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addItem} className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      field.onChange(value);
                      const subtotal = form.getValues('subtotal');
                      form.setValue('total', subtotal + value - form.getValues('discount'));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      field.onChange(value);
                      const subtotal = form.getValues('subtotal');
                      form.setValue('total', subtotal + form.getValues('tax') - value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="subtotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtotal</FormLabel>
                <FormControl>
                  <Input type="number" {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total</FormLabel>
                <FormControl>
                  <Input type="number" {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">
          {submitButtonLabel}
        </Button>
      </form>
    </Form>
  );
};
