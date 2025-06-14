
import { useState } from "react";
import { BarChart3, Download, Calendar, TrendingUp, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProductWithInventory } from "@/hooks/useProducts";
import { useTopMovingProducts } from "@/hooks/useInventoryAnalytics";
import { useSkuMonthlyMovements, useSkuStockLevels } from "@/hooks/useSkuAnalytics";
import { useInventoryReportPDF } from "@/hooks/useInventoryReportPDF";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useToast } from "@/hooks/use-toast";

interface InventoryReportsProps {
  products: ProductWithInventory[];
}

const InventoryReports = ({ products }: InventoryReportsProps) => {
  const [reportType, setReportType] = useState("monthly");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Fetch data using our new hooks
  const { data: skuMovements, isLoading: movementsLoading, error: movementsError } = useSkuMonthlyMovements(6);
  const { data: skuStockLevels, isLoading: stockLoading, error: stockError } = useSkuStockLevels();
  const { data: topMovers, isLoading: topMoversLoading, error: topMoversError } = useTopMovingProducts(10, 30);
  
  const { generatePDF } = useInventoryReportPDF();

  const handleExportReport = async () => {
    try {
      if (!skuMovements || !skuStockLevels || !topMovers) {
        toast({
          title: "Export Error",
          description: "Please wait for data to load before exporting",
          variant: "destructive",
        });
        return;
      }

      await generatePDF({
        skuMovements,
        skuStockLevels,
        topMovers,
      });

      toast({
        title: "Export Successful",
        description: "Inventory report has been downloaded",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  // Prepare data for pie chart (top 10 SKUs by stock level)
  const stockChartData = skuStockLevels?.slice(0, 10).map((item, index) => ({
    name: `${item.sku} (${item.size})`,
    value: item.current_stock,
    color: `hsl(${(index * 137.5) % 360}, 70%, 50%)` // Generate colors
  })) || [];

  // Group movements by SKU for display
  const movementsBySku = skuMovements?.reduce((acc, movement) => {
    const key = `${movement.sku}-${movement.size}`;
    if (!acc[key]) {
      acc[key] = {
        sku: movement.sku,
        product_name: movement.product_name,
        size: movement.size,
        movements: []
      };
    }
    acc[key].movements.push(movement);
    return acc;
  }, {} as Record<string, any>) || {};

  // Loading state
  if (movementsLoading || stockLoading || topMoversLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (movementsError || stockError || topMoversError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          Error loading reports: {movementsError?.message || stockError?.message || topMoversError?.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Inventory Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Report Type
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Summary</SelectItem>
                  <SelectItem value="movement">Movement Analysis</SelectItem>
                  <SelectItem value="valuation">Stock Valuation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Start Date
              </label>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder="Start date"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                End Date
              </label>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                placeholder="End date"
              />
            </div>
            <Button onClick={handleExportReport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Movement Analysis by SKU */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Movement Analysis by SKU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {Object.values(movementsBySku).slice(0, 8).map((skuData: any) => (
                <div key={`${skuData.sku}-${skuData.size}`} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{skuData.product_name}</h4>
                      <p className="text-sm text-gray-600">SKU: {skuData.sku} | Size: {skuData.size}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    {skuData.movements.map((movement: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-gray-600">{movement.month}:</span>
                        <span className={`font-semibold ${
                          movement.net_movement >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.net_movement >= 0 ? '+' : ''}{movement.net_movement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {Object.keys(movementsBySku).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No movement data available for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Levels by SKU */}
        <Card>
          <CardHeader>
            <CardTitle>Current Stock Levels by SKU</CardTitle>
          </CardHeader>
          <CardContent>
            {stockChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {stockChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} units`, 'Stock Level']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No stock data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Movers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Moving Products (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topMovers && topMovers.length > 0 ? (
            <div className="space-y-4">
              {topMovers.map((item, index) => (
                <div key={`${item.sku}-${item.size}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.product_name}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="font-medium">SKU: {item.sku}</span>
                        <span className="text-gray-400">•</span>
                        <span>Size: {item.size}</span>
                        <span className="text-gray-400">•</span>
                        <span>{item.total_moved.toLocaleString()} units moved</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">
                      {item.percentage}%
                    </div>
                    <div className="text-sm text-gray-500">of total movement</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No movement data available for this period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryReports;
