
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, DollarSign, TrendingUp } from "lucide-react";

interface InventoryStatsProps {
  totalProducts: number;
  lowStockCount: number;
  totalValue: number;
}

const InventoryStats = ({ totalProducts, lowStockCount, totalValue }: InventoryStatsProps) => {
  const stockHealthPercentage = totalProducts > 0 ? Math.round(((totalProducts - lowStockCount) / totalProducts) * 100) : 100;

  const stats = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      change: "Active SKUs",
      changeType: "neutral" as const,
      icon: Package,
      color: "blue" as const,
    },
    {
      title: "Low Stock Items",
      value: lowStockCount.toString(),
      change: lowStockCount > 0 ? "Requires attention" : "All stocked well",
      changeType: lowStockCount > 0 ? "negative" as const : "positive" as const,
      icon: AlertTriangle,
      color: lowStockCount > 0 ? "red" as const : "green" as const,
    },
    {
      title: "Inventory Value",
      value: `KD ${totalValue.toLocaleString()}`,
      change: "Current stock value",
      changeType: "neutral" as const,
      icon: DollarSign,
      color: "green" as const,
    },
    {
      title: "Stock Health",
      value: `${stockHealthPercentage}%`,
      change: "Well-stocked items",
      changeType: stockHealthPercentage >= 80 ? "positive" as const : stockHealthPercentage >= 60 ? "neutral" as const : "negative" as const,
      icon: TrendingUp,
      color: stockHealthPercentage >= 80 ? "green" as const : stockHealthPercentage >= 60 ? "orange" as const : "red" as const,
    },
  ];

  const getIconColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'red': return 'text-red-600 bg-red-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getChangeColorClass = (changeType: string) => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${getIconColorClass(stat.color)}`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <p className={`text-xs ${getChangeColorClass(stat.changeType)}`}>
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InventoryStats;
