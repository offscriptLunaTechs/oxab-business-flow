
import React, { memo, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  product_size: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceItemsProps {
  items: InvoiceItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdatePrice: (itemId: string, price: number) => void;
  onRemoveItem: (itemId: string) => void;
  isMobile?: boolean;
}

const InvoiceItems = memo(({
  items,
  onUpdateQuantity,
  onUpdatePrice,
  onRemoveItem,
  isMobile = false
}: InvoiceItemsProps) => {
  const [tempQuantities, setTempQuantities] = useState<Record<string, string>>({});

  const handleQuantityChange = useCallback((itemId: string, value: string) => {
    // Allow empty string temporarily for better UX
    setTempQuantities(prev => ({ ...prev, [itemId]: value }));
    
    // Only update the actual quantity if we have a valid number
    if (value !== '') {
      const quantity = parseInt(value) || 1;
      onUpdateQuantity(itemId, Math.max(1, quantity));
    }
  }, [onUpdateQuantity]);

  const handleQuantityBlur = useCallback((itemId: string) => {
    const tempValue = tempQuantities[itemId];
    if (tempValue === '' || parseInt(tempValue) < 1) {
      // Reset to 1 if empty or invalid when focus is lost
      onUpdateQuantity(itemId, 1);
      setTempQuantities(prev => {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [tempQuantities, onUpdateQuantity]);

  const handleQuantityFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text when focused for easy replacement
    e.target.select();
  }, []);

  const handlePriceChange = useCallback((itemId: string, value: string) => {
    const price = parseFloat(value) || 0;
    onUpdatePrice(itemId, price);
  }, [onUpdatePrice]);

  const getDisplayQuantity = useCallback((item: InvoiceItem) => {
    return tempQuantities[item.id] !== undefined ? tempQuantities[item.id] : item.quantity.toString();
  }, [tempQuantities]);

  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader className={isMobile ? "pb-3" : undefined}>
        <CardTitle className={isMobile ? "text-lg" : undefined}>
          Selected Items ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div 
              key={item.id}
              className={isMobile ? "border rounded-lg p-4 bg-gray-50" : "grid grid-cols-12 gap-4 py-3 px-4 border rounded-lg bg-gray-50"}
            >
              {isMobile ? (
                <>
                  {/* Mobile Layout */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.product_name}</div>
                      <div className="text-xs text-gray-600">SKU: {item.product_sku}</div>
                      <div className="text-xs text-gray-600">Size: {item.product_size}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-700">Quantity</Label>
                      <Input
                        type="number"
                        value={getDisplayQuantity(item)}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        onBlur={() => handleQuantityBlur(item.id)}
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
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
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
                </>
              ) : (
                <>
                  {/* Desktop Layout */}
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
                      value={getDisplayQuantity(item)}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      onBlur={() => handleQuantityBlur(item.id)}
                      onFocus={handleQuantityFocus}
                      className="h-8"
                      placeholder="1"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Price</Label>
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      className="h-8"
                      step="0.001"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Total</Label>
                    <Input
                      type="number"
                      value={item.total.toFixed(3)}
                      readOnly
                      className="h-8 bg-gray-100"
                    />
                  </div>

                  <div className="col-span-1 flex items-end">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => onRemoveItem(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

InvoiceItems.displayName = 'InvoiceItems';

export default InvoiceItems;
