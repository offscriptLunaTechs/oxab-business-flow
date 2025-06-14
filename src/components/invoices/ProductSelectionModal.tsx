
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, ChevronRight, PackageX, TrendingUp } from 'lucide-react';
import { useProducts, ProductWithInventory } from '@/hooks/useProducts';
import { useTopSellingProducts } from '@/hooks/invoices/useTopSellingProducts';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: ProductWithInventory) => void;
}

export const ProductSelectionModal = ({ isOpen, onClose, onSelectProduct }: ProductSelectionModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState<'popular' | 'oxab' | 'others'>('popular');
  
  const { data: allProducts = [], isLoading } = useProducts(searchTerm);
  const topSellingProducts = useTopSellingProducts();

  const popularProducts = allProducts
    .filter(product => topSellingProducts.includes(product.id) && product.status === 'active')
    .sort((a, b) => {
      const aIndex = topSellingProducts.indexOf(a.id);
      const bIndex = topSellingProducts.indexOf(b.id);
      return aIndex - bIndex;
    });

  const oxabProducts = allProducts.filter(product => 
    product.status === 'active' && (
      product.name.toLowerCase().includes('oxab') || 
      (product.sku && product.sku.toLowerCase().includes('oxab'))
    )
  );
  
  const otherProducts = allProducts.filter(product => 
    product.status === 'active' &&
    !product.name.toLowerCase().includes('oxab') && 
    (!product.sku || !product.sku.toLowerCase().includes('oxab'))
  );

  const getCurrentProducts = () => {
    switch (currentPage) {
      case 'popular': return popularProducts;
      case 'oxab': return oxabProducts;
      case 'others': return otherProducts;
      default: return popularProducts;
    }
  };

  const currentProducts = getCurrentProducts();

  const handleProductSelect = (product: ProductWithInventory) => {
    onSelectProduct(product);
    setSearchTerm('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setSearchTerm('');
        setCurrentPage('popular');
      }
    }}>
      <DialogContent className="max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] w-[95vw] sm:w-full flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Product</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex flex-col flex-grow overflow-hidden">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Page Navigation */}
          <div className="flex space-x-1 sm:space-x-2 border-b pb-2">
            <Button
              variant={currentPage === 'popular' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('popular')}
              className="flex-grow sm:flex-grow-0 justify-center text-xs sm:text-sm px-2 py-1.5 h-auto sm:px-3"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Popular</span>
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0.5">{popularProducts.length}</Badge>
            </Button>
            <Button
              variant={currentPage === 'oxab' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('oxab')}
              className="flex-grow sm:flex-grow-0 justify-center text-xs sm:text-sm px-2 py-1.5 h-auto sm:px-3"
            >
              <span>OXAB</span>
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0.5">{oxabProducts.length}</Badge>
            </Button>
            <Button
              variant={currentPage === 'others' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('others')}
              className="flex-grow sm:flex-grow-0 justify-center text-xs sm:text-sm px-2 py-1.5 h-auto sm:px-3"
            >
              <span>Others</span>
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0.5">{otherProducts.length}</Badge>
            </Button>
          </div>

          {/* Products Grid */}
          {isLoading && <p className="text-center py-8 text-gray-500">Loading products...</p>}
          {!isLoading && currentProducts.length > 0 && (
            <div className="flex-grow overflow-y-auto pb-4 pr-1 -mr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-3 hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between bg-white"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm leading-tight flex-1">{product.name}</h4>
                        {currentPage === 'popular' && index < 3 && (
                          <Badge variant="outline" className="text-xs ml-2 bg-green-50 text-green-700 border-green-200">
                            #{index + 1}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <p><span className="font-medium">SKU:</span> {product.sku || 'N/A'}</p>
                        <p><span className="font-medium">Size:</span> {product.size || 'N/A'}</p>
                        {product.pack_size && (
                          <p><span className="font-medium">Pack:</span> {product.pack_size}</p>
                        )}
                        {product.trademark && (
                          <p><span className="font-medium">Brand:</span> {product.trademark}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t mt-auto">
                      <span className="text-sm font-bold text-green-600">
                        KWD {product.base_price.toFixed(3)}
                      </span>
                      <div className="flex items-center space-x-2">
                        {product.stock_level !== undefined && (
                           <Badge variant={product.is_discontinued ? "outline" : product.is_low_stock ? "destructive" : "secondary"} className="text-xs px-1.5 py-0.5">
                           {product.is_discontinued ? "Discontinued" : `Stock: ${product.stock_level}`}
                         </Badge>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-100">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            
          {!isLoading && currentProducts.length === 0 && (
            <div className="flex-grow flex flex-col items-center justify-center text-center py-8 text-gray-500">
              <PackageX className="h-12 w-12 mb-3 text-gray-400" />
              <p className="font-medium">
                {searchTerm ? 'No products match your search.' : `No ${currentPage} products available.`}
              </p>
              {searchTerm && <p className="text-xs">Try a different search term or clear the search.</p>}
            </div>
          )}

          {/* Navigation Footer */}
          <div className="flex justify-between items-center pt-4 border-t mt-auto">
             <Button
              variant="ghost"
              onClick={() => {
                const pages = ['popular', 'oxab', 'others'] as const;
                const currentIndex = pages.indexOf(currentPage);
                const nextIndex = (currentIndex + 1) % pages.length;
                setCurrentPage(pages[nextIndex]);
              }}
              className="flex items-center space-x-2 text-sm"
              disabled={isLoading}
            >
              <span>Next Category</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" onClick={() => {
                onClose();
                setSearchTerm(''); 
                setCurrentPage('popular');
            }} className="text-sm">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
