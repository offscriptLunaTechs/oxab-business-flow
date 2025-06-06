
import { useState, useMemo } from "react";
import { Search, Package, AlertTriangle, CheckCircle, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductWithInventory } from "@/hooks/useProducts";

interface StockLevelsTableProps {
  products: ProductWithInventory[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const StockLevelsTable = ({ products, searchTerm, onSearchChange }: StockLevelsTableProps) => {
  const [sortField, setSortField] = useState<'name' | 'stock_level' | 'base_price'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'stock_level') {
        aValue = a.stock_level || 0;
        bValue = b.stock_level || 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [products, searchTerm, sortField, sortDirection]);

  const handleSort = (field: 'name' | 'stock_level' | 'base_price') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStockStatus = (product: ProductWithInventory) => {
    const stockLevel = product.stock_level || 0;
    const reorderLevel = product.inventory?.reorder_level || 10;

    if (stockLevel === 0) {
      return { status: 'out', color: 'bg-red-100 text-red-800', label: 'Out of Stock' };
    } else if (stockLevel <= reorderLevel) {
      return { status: 'low', color: 'bg-orange-100 text-orange-800', label: 'Low Stock' };
    } else {
      return { status: 'good', color: 'bg-green-100 text-green-800', label: 'In Stock' };
    }
  };

  const getStockIcon = (status: string) => {
    switch (status) {
      case 'out':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'low':
        return <Package className="h-4 w-4 text-orange-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Levels ({filteredAndSortedProducts.length} items)
          </CardTitle>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('name')}
                >
                  Product {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>SKU</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('stock_level')}
                >
                  Stock {sortField === 'stock_level' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('base_price')}
                >
                  Price {sortField === 'base_price' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                const stockLevel = product.stock_level || 0;
                const reorderLevel = product.inventory?.reorder_level || 10;
                const stockValue = stockLevel * product.base_price;

                return (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStockIcon(stockStatus.status)}
                        <Badge variant="outline" className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.size}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {stockLevel.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{reorderLevel}</TableCell>
                    <TableCell>KD {product.base_price.toFixed(3)}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        KD {stockValue.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No products found</p>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search terms
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockLevelsTable;
