
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/invoice';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductSelectionModal = ({ isOpen, onClose, onSelectProduct }: ProductSelectionModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState<'oxab' | 'others'>('oxab');
  const { data: allProducts = [] } = useProducts(searchTerm);

  // Filter products by OXAB vs others
  const oxabProducts = allProducts.filter(product => 
    product.name.toLowerCase().includes('oxab') || 
    product.sku.toLowerCase().includes('oxab')
  );
  
  const otherProducts = allProducts.filter(product => 
    !product.name.toLowerCase().includes('oxab') && 
    !product.sku.toLowerCase().includes('oxab')
  );

  const currentProducts = currentPage === 'oxab' ? oxabProducts : otherProducts;

  const handleProductSelect = (product: Product) => {
    onSelectProduct(product);
    onClose();
    setSearchTerm('');
    setCurrentPage('oxab');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Product</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Page Navigation */}
          <div className="flex space-x-2 border-b">
            <Button
              variant={currentPage === 'oxab' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('oxab')}
              className="flex items-center space-x-2"
            >
              <span>OXAB Products</span>
              <Badge variant="secondary">{oxabProducts.length}</Badge>
            </Button>
            <Button
              variant={currentPage === 'others' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('others')}
              className="flex items-center space-x-2"
            >
              <span>Other Products</span>
              <Badge variant="secondary">{otherProducts.length}</Badge>
            </Button>
          </div>

          {/* Products Grid */}
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><span className="font-medium">SKU:</span> {product.sku}</p>
                      <p><span className="font-medium">Size:</span> {product.size}</p>
                      {product.pack_size && (
                        <p><span className="font-medium">Pack Size:</span> {product.pack_size}</p>
                      )}
                      {product.trademark && (
                        <p><span className="font-medium">Brand:</span> {product.trademark}</p>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium text-green-600">
                        ${product.base_price}
                      </span>
                      {product.stock_level !== undefined && (
                        <Badge variant={product.is_low_stock ? "destructive" : "secondary"}>
                          Stock: {product.stock_level}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {currentProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No products found matching your search.' : `No ${currentPage === 'oxab' ? 'OXAB' : 'other'} products available.`}
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage === 'oxab' ? 'others' : 'oxab')}
              className="flex items-center space-x-2"
            >
              {currentPage === 'oxab' ? (
                <>
                  <span>View Other Products</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to OXAB Products</span>
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
