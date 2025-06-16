
import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Package, Plus, TrendingUp } from 'lucide-react';
import { Product } from '@/types/invoice';
import { useProductSearch } from '@/hooks/invoices/creation/useProductSearch';

interface ProductSelectorProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onProductSelect: (product: Product) => void;
  onBrowseClick: () => void;
  isLoading?: boolean;
  isMobile?: boolean;
}

const ProductSelector = memo(({
  searchTerm,
  onSearchTermChange,
  onProductSelect,
  onBrowseClick,
  isLoading = false,
  isMobile = false
}: ProductSelectorProps) => {
  const { displayProducts, isLoading: isProductsLoading } = useProductSearch(searchTerm);

  const handleProductClick = useCallback((product: Product) => {
    if (isLoading) return;
    onProductSelect(product);
    onSearchTermChange('');
  }, [onProductSelect, onSearchTermChange, isLoading]);

  return (
    <Card>
      <CardHeader className={isMobile ? "pb-3" : undefined}>
        <CardTitle className={isMobile ? "text-lg flex items-center" : undefined}>
          {isMobile && <TrendingUp className="h-5 w-5 mr-2 text-green-600" />}
          Add Products
        </CardTitle>
        {!searchTerm && displayProducts.length > 0 && isMobile && (
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
              onChange={(e) => onSearchTermChange(e.target.value)}
              className={isMobile ? "pl-10 h-12 text-base" : "pl-10"}
              disabled={isLoading}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={onBrowseClick}
            className={isMobile ? "h-12 px-4" : undefined}
            disabled={isLoading}
          >
            <Package className="h-5 w-5 mr-2" /> 
            Browse
          </Button>
        </div>

        {/* Product Results */}
        {(isProductsLoading || isLoading) && (
          <p className="text-center py-8 text-gray-500">Loading products...</p>
        )}

        {!isProductsLoading && !isLoading && displayProducts.length > 0 && (
          <div className={`space-y-2 ${isMobile ? 'max-h-64 overflow-y-auto' : ''}`}>
            {displayProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleProductClick(product)}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="font-medium text-sm">{product.name}</div>
                    {!searchTerm && index < 3 && isMobile && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                        Top Seller
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">SKU: {product.sku} • Size: {product.size}</div>
                  <div className="text-sm font-medium text-blue-600">KWD {product.base_price.toFixed(3)}</div>
                </div>
                <Button size="sm" variant="ghost" className="p-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {!isProductsLoading && !isLoading && searchTerm && displayProducts.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No products found. Try browsing or different search terms.
          </p>
        )}

        {!isProductsLoading && !isLoading && !searchTerm && displayProducts.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            Loading top-selling products...
          </p>
        )}
      </CardContent>
    </Card>
  );
});

ProductSelector.displayName = 'ProductSelector';

export default ProductSelector;
