
import { useState } from "react";
import { AlertTriangle, Package, ShoppingCart, Clock, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductWithInventory } from "@/hooks/useProducts";

interface LowStockModalProps {
  products: ProductWithInventory[];
  isOpen: boolean;
  onClose: () => void;
}

const LowStockModal = ({ products, isOpen, onClose }: LowStockModalProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Only include active products in low stock alerts - exclude discontinued items
  const activeProducts = products.filter(p => !p.is_discontinued);
  const lowStockProducts = activeProducts.filter(p => p.is_low_stock);
  const outOfStockProducts = activeProducts.filter(p => (p.stock_level || 0) === 0);
  const criticalStockProducts = activeProducts.filter(p => {
    const stockLevel = p.stock_level || 0;
    const reorderLevel = p.inventory?.reorder_level || 10;
    return stockLevel > 0 && stockLevel <= Math.floor(reorderLevel / 2);
  });

  const getReorderRecommendation = (product: ProductWithInventory) => {
    const currentStock = product.stock_level || 0;
    const reorderLevel = product.inventory?.reorder_level || 10;
    const recommendedOrder = Math.max(reorderLevel * 2, 50);
    
    return {
      recommendedQuantity: recommendedOrder,
      estimatedCost: recommendedOrder * product.base_price,
      urgency: currentStock === 0 ? 'critical' : currentStock <= Math.floor(reorderLevel / 2) ? 'high' : 'medium'
    };
  };

  const toggleSelection = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkReorder = () => {
    console.log('Creating bulk reorder for:', selectedItems);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <Clock className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Low Stock Items ({lowStockProducts.length} active products)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Active Stock Levels Good!</h3>
              <p className="text-gray-600">No active products require immediate attention.</p>
              <p className="text-sm text-gray-500 mt-2">
                Note: Discontinued products are excluded from stock alerts
              </p>
            </div>
          ) : (
            <>
              {/* Summary Alert */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have <strong>{lowStockProducts.length}</strong> active products with low stock levels, including{' '}
                  <strong>{outOfStockProducts.length}</strong> out of stock and{' '}
                  <strong>{criticalStockProducts.length}</strong> critically low items.
                  <br />
                  <span className="text-sm text-gray-600 mt-1 block">
                    Discontinued products are excluded from these alerts.
                  </span>
                </AlertDescription>
              </Alert>

              {/* Action Bar */}
              {selectedItems.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-medium text-blue-900">
                          {selectedItems.length} items selected for reorder
                        </p>
                        <p className="text-sm text-blue-700">
                          Estimated total cost: KD {selectedItems.reduce((total, id) => {
                            const product = lowStockProducts.find(p => p.id === id);
                            if (product) {
                              const recommendation = getReorderRecommendation(product);
                              return total + recommendation.estimatedCost;
                            }
                            return total;
                          }, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedItems([])}
                          size="sm"
                        >
                          Clear Selection
                        </Button>
                        <Button 
                          onClick={handleBulkReorder}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Create Bulk Reorder
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Low Stock Items */}
              <div className="space-y-4">
                {lowStockProducts.map((product) => {
                  const recommendation = getReorderRecommendation(product);
                  const isSelected = selectedItems.includes(product.id);
                  const stockLevel = product.stock_level || 0;
                  const reorderLevel = product.inventory?.reorder_level || 10;

                  return (
                    <div 
                      key={product.id} 
                      className={`border rounded-lg p-4 transition-all ${
                        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(product.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{product.name}</h4>
                              <Badge 
                                variant="outline" 
                                className={getUrgencyColor(recommendation.urgency)}
                              >
                                {getUrgencyIcon(recommendation.urgency)}
                                <span className="ml-1">{recommendation.urgency.toUpperCase()}</span>
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Current Stock:</span>
                                <div className="text-lg font-semibold text-gray-900">
                                  {stockLevel.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">Reorder Level:</span>
                                <div className="text-lg font-semibold text-gray-900">
                                  {reorderLevel}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">Recommended Order:</span>
                                <div className="text-lg font-semibold text-blue-600">
                                  {recommendation.recommendedQuantity.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">Estimated Cost:</span>
                                <div className="text-lg font-semibold text-green-600">
                                  KD {recommendation.estimatedCost.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Reorder Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LowStockModal;
