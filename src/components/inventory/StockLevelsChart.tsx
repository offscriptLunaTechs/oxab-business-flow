
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SkuStockLevel } from "@/hooks/useSkuAnalytics";

interface StockLevelsChartProps {
  skuStockLevels: SkuStockLevel[] | undefined;
}

const StockLevelsChart = ({ skuStockLevels }: StockLevelsChartProps) => {
  // Prepare data for pie chart (top 10 SKUs by stock level)
  const stockChartData = skuStockLevels?.slice(0, 10).map((item, index) => ({
    name: `${item.sku} (${item.size})`,
    value: item.current_stock,
    color: `hsl(${(index * 137.5) % 360}, 70%, 50%)` // Generate colors
  })) || [];

  return (
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
  );
};

export default StockLevelsChart;
