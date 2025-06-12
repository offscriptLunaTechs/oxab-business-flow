
import React from 'react';
import { format } from 'date-fns';
import { Package, TrendingUp, TrendingDown, RotateCcw, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStockMovements } from '@/hooks/useStockMovements';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const MovementHistory = () => {
  const { data: movements = [], isLoading, error } = useStockMovements(50);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Movements</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Movements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">Error loading stock movements: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'in':
        return 'bg-green-50 border-green-200';
      case 'out':
        return 'bg-red-50 border-red-200';
      case 'adjustment':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'in':
        return 'default';
      case 'out':
        return 'destructive';
      case 'adjustment':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Stock Movements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {movements.length > 0 ? (
            movements.map((movement) => (
              <div
                key={movement.id}
                className={`p-4 rounded-lg border ${getMovementColor(movement.movement_type)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getMovementIcon(movement.movement_type)}
                    <div>
                      <h4 className="font-medium text-sm">
                        {movement.product?.name || 'Unknown Product'}
                      </h4>
                      <p className="text-xs text-gray-500">
                        SKU: {movement.product?.sku || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getBadgeVariant(movement.movement_type) as any}>
                    {movement.movement_type.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">
                      Qty: <span className="font-medium">{movement.quantity}</span>
                    </span>
                    <span className="text-gray-600">
                      Stock: {movement.previous_stock} → {movement.new_stock}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {format(new Date(movement.created_at), 'MMM d, yyyy HH:mm')}
                    </p>
                    {movement.invoice_id && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600">
                        <FileText className="h-3 w-3" />
                        <span>Invoice: {movement.invoice_id}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {movement.reason && (
                  <p className="text-xs text-gray-600 mt-2 italic">
                    {movement.reason}
                  </p>
                )}
                
                {movement.performed_by && (
                  <p className="text-xs text-gray-500 mt-1">
                    By: {movement.performed_by}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p>No stock movements found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MovementHistory;
