
import { useState } from "react";
import { BarChart3, Download, Calendar, TrendingUp, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProductWithInventory } from "@/hooks/useProducts";
import { useMonthlyMovements, useTopMovingProducts, useVarianceSummary } from "@/hooks/useInventoryAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface InventoryReportsProps {
  products: ProductWithInventory[];
}

const InventoryReports = ({ products }: InventoryReportsProps) => {
  const [reportType, setReportType] = useState("monthly");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Fetch real data using our new hooks
  const { data: monthlyData, isLoading: monthlyLoading, error: monthlyError } = useMonthlyMovements(6);
  const { data: topMovers, isLoading: topMoversLoading, error: topMoversError } = useTopMovingProducts(4, 30);
  const { data: varianceSummary, isLoading: varianceLoading, error: varianceError } = useVarianceSummary(6);

  const stockDistribution = [
    { name: 'In Stock', value: products.filter(p => !p.is_low_stock).length, color: '#10B981' },
    { name: 'Low Stock', value: products.filter(p => p.is_low_stock && (p.stock_level || 0) > 0).length, color: '#F59E0B' },
    { name: 'Out of Stock', value: products.filter(p => (p.stock_level || 0) === 0).length, color: '#EF4444' },
  ];

  const handleExportReport = () => {
    console.log('Exporting report:', reportType);
    // TODO: Implement actual export functionality
  };

  // Custom render function for variance bars
  const renderVarianceBar = (props: any) => {
    const { payload, x, y, width, height } = props;
    const fill = payload.variance >= 0 ? "#10B981" : "#EF4444";
    
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
      />
    );
  };

  // Loading state
  if (monthlyLoading || topMoversLoading || varianceLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (monthlyError || topMoversError || varianceError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          Error loading reports: {monthlyError?.message || topMoversError?.message || varianceError?.message}
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
                  <SelectItem value="variance">Variance Analysis</SelectItem>
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
        {/* Monthly Movement Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Movement Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="inbound" name="Inbound" fill="#10B981" />
                <Bar dataKey="outbound" name="Outbound" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {stockDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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

      {/* Variance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Variance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="variance" name="Net Variance" shape={renderVarianceBar} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">
                +{varianceSummary?.positive_variance?.toLocaleString() || '0'}
              </div>
              <div className="text-gray-600">Positive Variance</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-semibold text-red-600">
                {varianceSummary?.negative_variance?.toLocaleString() || '0'}
              </div>
              <div className="text-gray-600">Negative Variance</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">
                {varianceSummary?.net_variance && varianceSummary.net_variance >= 0 ? '+' : ''}
                {varianceSummary?.net_variance?.toLocaleString() || '0'}
              </div>
              <div className="text-gray-600">Net Variance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryReports;
