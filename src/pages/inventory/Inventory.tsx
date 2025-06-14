
import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, TrendingUp, BarChart3, Settings } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useInventorySync } from "@/hooks/useInventorySync";
import StockLevelsTable from "@/components/inventory/StockLevelsTable";
import LowStockModal from "@/components/inventory/LowStockModal";
import MovementHistory from "@/components/inventory/MovementHistory";
import InventoryReports from "@/components/inventory/InventoryReports";
import InventoryStats from "@/components/inventory/InventoryStats";
import ProductManagement from "@/components/inventory/ProductManagement";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockModalOpen, setLowStockModalOpen] = useState(false);
  const { data: products, isLoading, error, refetch } = useProducts(searchTerm);
  const { refreshInventoryData } = useInventorySync();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading inventory: {error.message}</p>
      </div>
    );
  }

  // Filter active products for stats - discontinued products should not count towards low stock
  const activeProducts = products?.filter(p => !p.is_discontinued) || [];
  const lowStockCount = activeProducts.filter(p => p.is_low_stock).length;
  const totalProducts = products?.length || 0;
  const totalActiveProducts = activeProducts.length;
  const totalValue = activeProducts.reduce((sum, p) => sum + (p.stock_level || 0) * p.base_price, 0);

  const handleStockUpdate = () => {
    refreshInventoryData();
    refetch();
  };

  const handleLowStockClick = () => {
    setLowStockModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Monitor stock levels, movements, and manage products</p>
        </div>
      </div>

      {/* Stats Cards */}
      <InventoryStats 
        totalProducts={totalActiveProducts}
        lowStockCount={lowStockCount}
        totalValue={totalValue}
        onLowStockClick={handleLowStockClick}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="stock-levels" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="stock-levels" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Stock Levels</span>
            <span className="sm:hidden">Stock</span>
          </TabsTrigger>
          <TabsTrigger value="product-management" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Product Management</span>
            <span className="sm:hidden">Products</span>
          </TabsTrigger>
          <TabsTrigger value="movements" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Movements</span>
            <span className="sm:hidden">History</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
            <span className="sm:hidden">Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock-levels" className="mt-6">
          <StockLevelsTable 
            products={products || []}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onStockUpdate={handleStockUpdate}
          />
        </TabsContent>

        <TabsContent value="product-management" className="mt-6">
          <ProductManagement 
            products={products || []} 
            onProductUpdate={handleStockUpdate}
          />
        </TabsContent>

        <TabsContent value="movements" className="mt-6">
          <MovementHistory />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <InventoryReports products={products || []} />
        </TabsContent>
      </Tabs>

      {/* Low Stock Modal */}
      <LowStockModal
        products={products || []}
        isOpen={lowStockModalOpen}
        onClose={() => setLowStockModalOpen(false)}
      />
    </div>
  );
};

export default Inventory;
