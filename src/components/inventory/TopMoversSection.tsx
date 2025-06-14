
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopMovingProduct } from "@/hooks/useInventoryAnalytics";

interface TopMoversSectionProps {
  topMovers: TopMovingProduct[] | undefined;
}

const TopMoversSection = ({ topMovers }: TopMoversSectionProps) => {
  return (
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
  );
};

export default TopMoversSection;
