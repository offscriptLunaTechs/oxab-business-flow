
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Loader2 } from 'lucide-react';
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
  if (items.length === 0) return null;

  const handleQuantityChange = (index: number, value: string) => {
    const quantity = parseInt(value) || 1;
    updateItemQuantity(index, quantity);
  };

  const handlePriceChange = (index: number, value: string) => {
    const price = parseFloat(value) || 0;
    updateItemPrice(index, price);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Selected Items ({items.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => {
            const key = item.tempId || `${item.product_id}-${index}`;
            
            return (
              <div 
                key={key}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  item.isOptimistic 
                    ? 'bg-blue-50 border-blue-200 animate-pulse' 
                    : 'bg-gray-50'
                }`}
              >
                {/* Product Info */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="font-medium text-sm">{item.product_name}</div>
                      {item.isOptimistic && (
                        <Loader2 className="h-3 w-3 ml-2 animate-spin text-blue-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-600">SKU: {item.product_sku}</div>
                    <div className="text-xs text-gray-600">Size: {item.product_size}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700 p-2"
                    disabled={item.isOptimistic}
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
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      min="1"
                      className="h-10 text-center text-base"
                      disabled={item.isOptimistic}
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
                      disabled={item.isOptimistic}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Total</Label>
                    <div className={`h-10 px-3 py-2 bg-white border rounded-md flex items-center justify-center text-base font-medium ${
                      item.isOptimistic ? 'text-blue-600' : ''
                    }`}>
                      {item.total.toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

SelectedItemsCard.displayName = 'SelectedItemsCard';

export default SelectedItemsCard;
