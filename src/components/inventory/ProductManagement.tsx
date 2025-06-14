
import { useState } from "react";
import { Search, Package, Plus, MoreHorizontal, Edit, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProductWithInventory } from "@/hooks/useProducts";
import ProductForm from "./ProductForm";
import ProductStatusModal from "./ProductStatusModal";
import EditProductModal from "./EditProductModal";

interface ProductManagementProps {
  products: ProductWithInventory[];
  onProductUpdate?: () => void;
}

const ProductManagement = ({ products, onProductUpdate }: ProductManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductWithInventory | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (product: ProductWithInventory) => {
    setSelectedProduct(product);
    setStatusModalOpen(true);
  };

  const handleEditProduct = (product: ProductWithInventory) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleSuccess = () => {
    if (onProductUpdate) {
      onProductUpdate();
    }
    setSelectedProduct(null);
    setStatusModalOpen(false);
    setEditModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
      case 'discontinued':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Discontinued</span>;
      case 'inactive':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Inactive</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Management ({filteredProducts.length} products)
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <ProductForm onSuccess={handleSuccess} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Price (KD)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      {product.trademark && (
                        <div className="text-sm text-gray-500">{product.trademark}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>{product.size}</TableCell>
                  <TableCell>KD {product.base_price.toFixed(3)}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell>
                    <div className="font-semibold">
                      {product.is_discontinued ? '-' : (product.stock_level || 0).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {new Date(product.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(product)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Change Status
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredProducts.length === 0 && (
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

      {/* Modals */}
      {selectedProduct && (
        <>
          <ProductStatusModal
            product={selectedProduct}
            isOpen={statusModalOpen}
            onClose={() => setStatusModalOpen(false)}
            onSuccess={handleSuccess}
          />
          <EditProductModal
            product={selectedProduct}
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </Card>
  );
};

export default ProductManagement;
