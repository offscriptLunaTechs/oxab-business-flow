import React, { useState, useMemo } from 'react';
import { Search, Package, AlertTriangle, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProducts, ProductWithInventory } from '@/hooks/useProducts';
import { Customer } from '@/types/invoice';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface InvoiceItem {
  product: ProductWithInventory;
  quantity: number;
  price: number;
  total: number;
}

interface ProductSelectionProps {
  customer: Customer;
  items: InvoiceItem[];
  onItemsChange: (items: InvoiceItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const ProductSelection: React.FC<ProductSelectionProps> = ({
  customer,
  items,
  onItemsChange,
  onNext,
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: products, isLoading, error } = useProducts(searchTerm);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product => !items.find(item => item.product.id === product.id));
  }, [products, items]);

  const addProduct = (product: ProductWithInventory) => {
    const newItem: InvoiceItem = {
      product,
      quantity: 1,
      price: product.base_price,
      total: product.base_price,
    };
    onItemsChange([...items, newItem]);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }

    const updatedItems = items.map((item, i) => {
      if (i === index) {
        const total = quantity * item.price;
        return { ...item, quantity, total };
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const updatePrice = (index: number, price: number) => {
    const updatedItems = items.map((item, i) => {
      if (i === index) {
        const total = item.quantity * price;
        return { ...item, price, total };
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading products: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Products</h2>
        <p className="text-gray-600">
          Adding products for <span className="font-semibold">{customer.name}</span>
        </p>
      </div>

      {/* Selected Items */}
      {items.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Selected Items ({items.length})
          </h3>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                    {item.product.is_low_stock && (
                      <div className="flex items-center mt-1">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
                        <span className="text-xs text-orange-600">Low Stock: {item.product.stock_level} left</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-center border-0 focus:ring-0"
                        min="1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(e) => updatePrice(index, parseFloat(e.target.value) || 0)}
                      className="w-24 h-8"
                      step="0.001"
                      min="0"
                    />
                    <span className="text-sm font-medium w-20 text-right">
                      KD {item.total.toFixed(3)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal:</span>
                <span>KD {subtotal.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Products */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search products to add..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Available Products */}
      {!isLoading && (
        <div className="grid gap-3 max-h-64 overflow-y-auto">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50"
              onClick={() => addProduct(product)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      product.is_low_stock ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">SKU: {product.sku} | Size: {product.size}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">KD {product.base_price.toFixed(3)}</Badge>
                        {product.is_low_stock ? (
                          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low Stock: {product.stock_level}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            Stock: {product.stock_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && filteredProducts.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No products found</p>
          <p className="text-sm text-gray-500 mt-2">
            Try adjusting your search terms
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="px-8 py-3 text-lg h-auto"
        >
          Back: Select Customer
        </Button>
        <Button
          onClick={onNext}
          disabled={items.length === 0}
          size="lg"
          className="px-8 py-3 text-lg h-auto"
        >
          Next: Review & Confirm
        </Button>
      </div>
    </div>
  );
};

export default ProductSelection;
