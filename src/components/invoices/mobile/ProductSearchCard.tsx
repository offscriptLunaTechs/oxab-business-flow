
import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Package, Plus, TrendingUp } from 'lucide-react';
import { Product } from '@/types/invoice';

interface ProductSearchCardProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  displayProducts: Product[];
  addProductFromSearch: (product: Product) => void;
  setIsProductModalOpen: (value: boolean) => void;
  isAddingItem?: boolean;
}

const ProductSearchCard = ({
  searchTerm,
  setSearchTerm,
  displayProducts,
  addProductFromSearch,
  setIsProductModalOpen,
  isAddingItem = false
}: ProductSearchCardProps) => {
  const handleProductClick = useCallback(async (product: Product) => {
    if (isAddingItem) return;
    
    try {
      await addProductFromSearch(product);
      setSearchTerm('');
    } catch (error) {
      console.error('Error adding product:', error);
    }
  }, [addProductFromSearch, setSearchTerm, isAddingItem]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
          Add Products
        </CardTitle>
        {!searchTerm && displayProducts.length > 0 && (
          <p className="text-sm text-gray-600">Showing top-selling products</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Browse */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
              disabled={isAddingItem}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsProductModalOpen(true)} 
            className="h-12 px-4"
            disabled={isAddingItem}
          >
            <Package className="h-5 w-5 mr-2" /> 
            Browse
          </Button>
        </div>

        {/* Product Results */}
        {displayProducts.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {displayProducts.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${
                  isAddingItem 
                    ? 'opacity-60 cursor-not-allowed bg-gray-50' 
                    : 'hover:bg-gray-50 cursor-pointer'
                }`}
                onClick={() => !isAddingItem && handleProductClick(product)}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="font-medium text-sm">{product.name}</div>
                    {!searchTerm && index < 3 && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                        Top Seller
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">SKU: {product.sku} • Size: {product.size}</div>
                  <div className="text-sm font-medium text-blue-600">KWD {product.base_price.toFixed(3)}</div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="p-2"
                  disabled={isAddingItem}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {searchTerm && displayProducts.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No products found. Try browsing or different search terms.</p>
        )}

        {!searchTerm && displayProducts.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">Loading top-selling products...</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductSearchCard;
