
import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Package, TrendingUp, BarChart3 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import StockLevelsTable from "@/components/inventory/StockLevelsTable";
import LowStockAlerts from "@/components/inventory/LowStockAlerts";
import MovementHistory from "@/components/inventory/MovementHistory";
import InventoryReports from "@/components/inventory/InventoryReports";
import InventoryStats from "@/components/inventory/InventoryStats";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: products, isLoading, error } = useProducts(searchTerm);

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

  const lowStockCount = products?.filter(p => p.is_low_stock).length || 0;
  const totalProducts = products?.length || 0;
  const totalValue = products?.reduce((sum, p) => sum + (p.stock_level || 0) * p.base_price, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Monitor stock levels, movements, and generate reports</p>
        </div>
      </div>

      {/* Stats Cards */}
      <InventoryStats 
        totalProducts={totalProducts}
        lowStockCount={lowStockCount}
        totalValue={totalValue}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="stock-levels" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="stock-levels" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Stock Levels</span>
            <span className="sm:hidden">Stock</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Low Stock</span>
            <span className="sm:hidden">Alerts</span>
            {lowStockCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                {lowStockCount}
              </span>
            )}
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
          />
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <LowStockAlerts products={products || []} />
        </TabsContent>

        <TabsContent value="movements" className="mt-6">
          <MovementHistory />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <InventoryReports products={products || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
