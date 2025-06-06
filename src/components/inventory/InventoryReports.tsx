
import { useState } from "react";
import { BarChart3, Download, Calendar, TrendingUp, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { ProductWithInventory } from "@/hooks/useProducts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface InventoryReportsProps {
  products: ProductWithInventory[];
}

const InventoryReports = ({ products }: InventoryReportsProps) => {
  const [reportType, setReportType] = useState("monthly");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Mock data for demonstration - in real app this would come from analytics hooks
  const monthlyData = [
    { month: 'Jan', inbound: 2400, outbound: 1800, variance: 600 },
    { month: 'Feb', inbound: 1800, outbound: 2200, variance: -400 },
    { month: 'Mar', inbound: 3200, outbound: 2800, variance: 400 },
    { month: 'Apr', inbound: 2800, outbound: 2600, variance: 200 },
    { month: 'May', inbound: 3600, outbound: 3200, variance: 400 },
    { month: 'Jun', inbound: 2200, outbound: 1900, variance: 300 },
  ];

  const topMovers = [
    { name: 'OXAB 500ml', moved: 850, type: 'out', percentage: 35 },
    { name: 'OXAB 330ml', moved: 720, type: 'out', percentage: 30 },
    { name: 'OXAB 1L', moved: 480, type: 'out', percentage: 20 },
    { name: 'OXAB 200ml', moved: 360, type: 'out', percentage: 15 },
  ];

  const stockDistribution = [
    { name: 'In Stock', value: products.filter(p => !p.is_low_stock).length, color: '#10B981' },
    { name: 'Low Stock', value: products.filter(p => p.is_low_stock && (p.stock_level || 0) > 0).length, color: '#F59E0B' },
    { name: 'Out of Stock', value: products.filter(p => (p.stock_level || 0) === 0).length, color: '#EF4444' },
  ];

  const handleExportReport = () => {
    // Implementation for exporting reports
    console.log('Exporting report:', reportType);
  };

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
              <BarChart data={monthlyData}>
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
            Top Moving Products (This Month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topMovers.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.moved.toLocaleString()} units moved
                    </p>
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
        </CardContent>
      </Card>

      {/* Variance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Variance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="variance" 
                name="Net Variance"
                fill={(dataKey) => dataKey >= 0 ? "#10B981" : "#EF4444"}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">+1,500</div>
              <div className="text-gray-600">Positive Variance</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-semibold text-red-600">-400</div>
              <div className="text-gray-600">Negative Variance</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">+1,100</div>
              <div className="text-gray-600">Net Variance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryReports;
