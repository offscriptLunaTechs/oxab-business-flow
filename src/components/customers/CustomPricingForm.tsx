
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useCreateCustomerPricing } from '@/hooks/useCustomerPricingMutations';
import { cn } from '@/lib/utils';

interface PricingEntry {
  customer_id: string;
  product_id: string;
  price: number;
  effective_date: Date | null;
  expires_date: Date | null;
}

export const CustomPricingForm = () => {
  const [entries, setEntries] = useState<PricingEntry[]>([
    {
      customer_id: '',
      product_id: '',
      price: 0,
      effective_date: new Date(),
      expires_date: null,
    }
  ]);

  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();
  const createPricingMutation = useCreateCustomerPricing();

  const addEntry = () => {
    setEntries([...entries, {
      customer_id: '',
      product_id: '',
      price: 0,
      effective_date: new Date(),
      expires_date: null,
    }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (index: number, field: keyof PricingEntry, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const handleSubmit = async () => {
    // Validate entries
    const validEntries = entries.filter(entry => 
      entry.customer_id && entry.product_id && entry.price > 0
    );

    if (validEntries.length === 0) {
      return;
    }

    // Create pricing entries one by one
    for (const entry of validEntries) {
      await createPricingMutation.mutateAsync({
        customer_id: entry.customer_id,
        product_id: entry.product_id,
        price: entry.price,
        effective_date: entry.effective_date?.toISOString().split('T')[0],
        expires_date: entry.expires_date?.toISOString().split('T')[0],
        is_active: true,
      });
    }

    // Reset form
    setEntries([{
      customer_id: '',
      product_id: '',
      price: 0,
      effective_date: new Date(),
      expires_date: null,
    }]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Custom Pricing Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {entries.map((entry, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Pricing Entry {index + 1}</h4>
              {entries.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEntry(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select
                  value={entry.customer_id}
                  onValueChange={(value) => updateEntry(index, 'customer_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} ({customer.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Product</Label>
                <Select
                  value={entry.product_id}
                  onValueChange={(value) => updateEntry(index, 'product_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Custom Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={entry.price}
                  onChange={(e) => updateEntry(index, 'price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !entry.effective_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {entry.effective_date ? format(entry.effective_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={entry.effective_date || undefined}
                      onSelect={(date) => updateEntry(index, 'effective_date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Expiry Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !entry.expires_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {entry.expires_date ? format(entry.expires_date, "PPP") : "No expiry date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={entry.expires_date || undefined}
                      onSelect={(date) => updateEntry(index, 'expires_date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <Button onClick={addEntry} variant="outline" className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Entry
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createPricingMutation.isPending}
            className="flex-1"
          >
            {createPricingMutation.isPending ? 'Creating...' : 'Create Pricing Entries'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
