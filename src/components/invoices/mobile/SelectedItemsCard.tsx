
import React, { memo, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { Item } from '@/hooks/invoices/useInvoiceItems';

interface SelectedItemsCardProps {
  items: Item[];
  updateItemQuantity: (index: number, quantity: number) => void;
  updateItemPrice: (index: number, price: number) => void;
  removeItem: (index: number) => void;
}

const SelectedItemsCard = memo(({
  items,
  updateItemQuantity,
  updateItemPrice,
  removeItem
}: SelectedItemsCardProps) => {
  const [tempQuantities, setTempQuantities] = useState<Record<number, string>>({});

  const handleQuantityChange = useCallback((index: number, value: string) => {
    // Allow empty string temporarily for better UX
    setTempQuantities(prev => ({ ...prev, [index]: value }));
    
    // Only update the actual quantity if we have a valid number
    if (value !== '') {
      const quantity = parseInt(value) || 1;
      updateItemQuantity(index, Math.max(1, quantity));
    }
  }, [updateItemQuantity]);

  const handleQuantityBlur = useCallback((index: number) => {
    const tempValue = tempQuantities[index];
    if (tempValue === '' || parseInt(tempValue) < 1) {
      // Reset to 1 if empty or invalid when focus is lost
      updateItemQuantity(index, 1);
      setTempQuantities(prev => {
        const { [index]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [tempQuantities, updateItemQuantity]);

  const handleQuantityFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text when focused for easy replacement
    e.target.select();
  }, []);

  const handlePriceChange = useCallback((index: number, value: string) => {
    const price = parseFloat(value) || 0;
    updateItemPrice(index, price);
  }, [updateItemPrice]);

  const getDisplayQuantity = useCallback((item: Item, index: number) => {
    return tempQuantities[index] !== undefined ? tempQuantities[index] : item.quantity.toString();
  }, [tempQuantities]);

  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Selected Items ({items.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div 
              key={`${item.product_id}-${index}`}
              className="border rounded-lg p-4 bg-gray-50"
            >
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
                    value={getDisplayQuantity(item, index)}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    onBlur={() => handleQuantityBlur(index)}
                    onFocus={handleQuantityFocus}
                    className="h-10 text-center text-base"
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-700">Price</Label>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
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
  );
});

SelectedItemsCard.displayName = 'SelectedItemsCard';

export default SelectedItemsCard;
