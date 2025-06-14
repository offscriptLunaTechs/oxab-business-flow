
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { SkuMonthlyMovement } from '@/hooks/useSkuAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SkuMovementChartsProps {
  skuMovements: SkuMonthlyMovement[];
}

interface ChartData {
  month: string;
  netMovement: number;
  inbound: number;
  outbound: number;
}

interface SkuData {
  sku: string;
  productName: string;
  size: string;
  chartData: ChartData[];
  totalNetMovement: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold">{label}</p>
        <p className="text-green-600">
          Inbound: +{data.inbound.toLocaleString()}
        </p>
        <p className="text-red-600">
          Outbound: -{data.outbound.toLocaleString()}
        </p>
        <p className={`font-semibold ${data.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          Net: {data.netMovement >= 0 ? '+' : ''}{data.netMovement.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const SkuMovementCharts = ({ skuMovements }: SkuMovementChartsProps) => {
  // Group movements by SKU and prepare chart data
  const skuData: SkuData[] = React.useMemo(() => {
    const groupedData = skuMovements.reduce((acc, movement) => {
      const key = `${movement.sku}-${movement.size}`;
      if (!acc[key]) {
        acc[key] = {
          sku: movement.sku,
          productName: movement.product_name,
          size: movement.size,
          movements: []
        };
      }
      acc[key].movements.push(movement);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData).map((skuGroup: any) => {
      const chartData = skuGroup.movements
        .sort((a: SkuMonthlyMovement, b: SkuMonthlyMovement) => {
          // Sort by month (assuming format "Mon YYYY")
          return new Date(a.month).getTime() - new Date(b.month).getTime();
        })
        .map((movement: SkuMonthlyMovement) => ({
          month: movement.month,
          netMovement: movement.net_movement,
          inbound: movement.inbound,
          outbound: movement.outbound
        }));

      const totalNetMovement = chartData.reduce((sum, data) => sum + data.netMovement, 0);

      return {
        sku: skuGroup.sku,
        productName: skuGroup.productName,
        size: skuGroup.size,
        chartData,
        totalNetMovement
      };
    }).sort((a, b) => Math.abs(b.totalNetMovement) - Math.abs(a.totalNetMovement)); // Sort by activity level
  }, [skuMovements]);

  if (skuData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No movement data available for this period
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {skuData.slice(0, 8).map((sku) => (
          <Card key={`${sku.sku}-${sku.size}`} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-900">{sku.productName}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>SKU: {sku.sku}</span>
                    <span>•</span>
                    <span>Size: {sku.size}</span>
                    <span>•</span>
                    <span className={`font-semibold ${
                      sku.totalNetMovement >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Net: {sku.totalNetMovement >= 0 ? '+' : ''}{sku.totalNetMovement}
                    </span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={sku.chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="netMovement" radius={[2, 2, 0, 0]}>
                    {sku.chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.netMovement >= 0 ? '#10B981' : '#EF4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {skuData.length > 8 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">
            Showing top 8 most active SKUs. Total SKUs with movement: {skuData.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default SkuMovementCharts;
