
import { useState } from "react";
import { Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductWithInventory } from "@/hooks/useProducts";
import { useInventorySync } from "@/hooks/useInventorySync";

interface ProductStatusModalProps {
  product: ProductWithInventory;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProductStatusModal = ({ product, isOpen, onClose, onSuccess }: ProductStatusModalProps) => {
  const [newStatus, setNewStatus] = useState<'active' | 'discontinued' | 'inactive'>(product.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { refreshInventoryData } = useInventorySync();

  const handleStatusUpdate = async () => {
    if (newStatus === product.status) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(`Updating product ${product.id} status from ${product.status} to ${newStatus}`);

      const { error } = await supabase
        .from('products')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) {
        console.error('Error updating product status:', error);
        throw error;
      }

      console.log('Product status updated successfully');

      toast({
        title: "Status Updated",
        description: `${product.name} status changed from ${product.status} to ${newStatus}.`,
      });

      refreshInventoryData();
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();

    } catch (error: any) {
      console.error('Failed to update product status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'active':
        return 'Product is available for sale and ordering.';
      case 'discontinued':
        return 'Product is no longer available for sale. Existing stock will not trigger low stock alerts.';
      case 'inactive':
        return 'Product is temporarily unavailable for sale.';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '🟢';
      case 'discontinued':
        return '🔴';
      case 'inactive':
        return '🟡';
      default:
        return '⚪';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Change Product Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
            <p className="text-sm text-gray-600">SKU: {product.sku}</p>
            <p className="text-sm text-gray-600">Current Status: 
              <span className="ml-1 font-medium">{getStatusIcon(product.status)} {product.status}</span>
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900">New Status</label>
            <Select value={newStatus} onValueChange={(value: 'active' | 'discontinued' | 'inactive') => setNewStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <span>🟢</span>
                    <span>Active</span>
                  </div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center gap-2">
                    <span>🟡</span>
                    <span>Inactive</span>
                  </div>
                </SelectItem>
                <SelectItem value="discontinued">
                  <div className="flex items-center gap-2">
                    <span>🔴</span>
                    <span>Discontinued</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{getStatusIcon(newStatus)} {newStatus}:</strong> {getStatusDescription(newStatus)}
            </p>
          </div>

          {newStatus === 'discontinued' && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <p className="text-sm text-orange-800">
                  <strong>Note:</strong> Discontinued products will be excluded from low stock alerts 
                  and will not appear in product selection for new invoices.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStatusUpdate}
              disabled={isSubmitting || newStatus === product.status}
            >
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductStatusModal;
