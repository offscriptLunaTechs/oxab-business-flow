import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { useInventorySync } from "@/hooks/useInventorySync";
import { ProductWithInventory } from "@/hooks/useProducts";

interface StockAdjustmentModalProps {
  product: ProductWithInventory;
  onSuccess: () => void;
}

const StockAdjustmentModal = ({ product, onSuccess }: StockAdjustmentModalProps) => {
  const [open, setOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove' | 'set'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { can } = usePermissions();
  const { refreshInventoryData, refreshProductData } = useInventorySync();

  // Only admins and managers can adjust stock
  if (!can.manageInventory()) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || parseInt(quantity) <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for the stock adjustment",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const currentStock = product.stock_level || 0;
      const adjustmentQty = parseInt(quantity);
      let newStock: number;
      let movementType: 'in' | 'out' | 'adjustment';
      let movementQuantity: number;

      switch (adjustmentType) {
        case 'add':
          newStock = currentStock + adjustmentQty;
          movementType = 'in';
          movementQuantity = adjustmentQty;
          break;
        case 'remove':
          newStock = Math.max(0, currentStock - adjustmentQty);
          movementType = 'out';
          movementQuantity = adjustmentQty;
          break;
        case 'set':
          newStock = adjustmentQty;
          movementType = 'adjustment';
          movementQuantity = adjustmentQty - currentStock;
          break;
        default:
          throw new Error('Invalid adjustment type');
      }

      // Update inventory using upsert to handle missing records
      const { error: inventoryError } = await supabase
        .from('inventory')
        .upsert({
          product_id: product.id,
          quantity: newStock,
          last_updated: new Date().toISOString(),
        }, {
          onConflict: 'product_id'
        });

      if (inventoryError) throw inventoryError;

      // Record stock movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: product.id,
          movement_type: movementType,
          quantity: Math.abs(movementQuantity),
          previous_stock: currentStock,
          new_stock: newStock,
          reason: `Manual adjustment: ${reason}`,
        });

      if (movementError) throw movementError;

      toast({
        title: "Stock Adjusted",
        description: `${product.name} stock updated from ${currentStock} to ${newStock}`,
      });

      // Close modal and reset form
      setOpen(false);
      setQuantity('');
      setReason('');
      setAdjustmentType('add');
      
      // Refresh all inventory data immediately
      refreshInventoryData();
      refreshProductData(product.id);
      onSuccess();

    } catch (error) {
      console.error('Stock adjustment error:', error);
      toast({
        title: "Adjustment Failed",
        description: "Failed to adjust stock level. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAdjustmentIcon = () => {
    switch (adjustmentType) {
      case 'add':
        return <Plus className="h-4 w-4" />;
      case 'remove':
        return <Minus className="h-4 w-4" />;
      case 'set':
        return <Edit className="h-4 w-4" />;
    }
  };

  const getExpectedResult = () => {
    const currentStock = product.stock_level || 0;
    const adjustmentQty = parseInt(quantity) || 0;

    switch (adjustmentType) {
      case 'add':
        return currentStock + adjustmentQty;
      case 'remove':
        return Math.max(0, currentStock - adjustmentQty);
      case 'set':
        return adjustmentQty;
      default:
        return currentStock;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock Level</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Product</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-gray-600">
                SKU: {product.sku} | Current Stock: {product.stock_level || 0}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="adjustmentType" className="text-sm font-medium text-gray-700">
              Adjustment Type
            </Label>
            <Select value={adjustmentType} onValueChange={(value: 'add' | 'remove' | 'set') => setAdjustmentType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Stock
                  </div>
                </SelectItem>
                <SelectItem value="remove">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4" />
                    Remove Stock
                  </div>
                </SelectItem>
                <SelectItem value="set">
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Set Exact Amount
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="mt-1"
              required
            />
            {quantity && (
              <div className="mt-2 text-sm text-gray-600">
                New stock level will be: <span className="font-medium">{getExpectedResult()}</span>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
              Reason for Adjustment
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for stock adjustment..."
              className="mt-1"
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
              {getAdjustmentIcon()}
              {isLoading ? 'Adjusting...' : 'Adjust Stock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustmentModal;
