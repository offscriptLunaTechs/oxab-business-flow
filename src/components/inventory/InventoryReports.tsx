
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductWithInventory } from "@/hooks/useProducts";
import { useTopMovingProducts } from "@/hooks/useInventoryAnalytics";
import { useSkuStockLevels } from "@/hooks/useSkuAnalytics";
import { useInventoryReportPDF } from "@/hooks/useInventoryReportPDF";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Package, TrendingUp } from "lucide-react";
import ReportControls from "./ReportControls";
import StockLevelsChart from "./StockLevelsChart";
import TopMoversSection from "./TopMoversSection";
import ProductSalesAnalysis from "./ProductSalesAnalysis";

interface InventoryReportsProps {
  products: ProductWithInventory[];
}

const InventoryReports = ({ products }: InventoryReportsProps) => {
  const [reportType, setReportType] = useState("monthly");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Fetch data using our hooks
  const { data: skuStockLevels, isLoading: stockLoading, error: stockError } = useSkuStockLevels();
  const { data: topMovers, isLoading: topMoversLoading, error: topMoversError } = useTopMovingProducts(10, 30);
  
  const { generatePDF } = useInventoryReportPDF();

  const handleExportReport = async () => {
    try {
      if (!skuStockLevels || !topMovers) {
        toast({
          title: "Export Error",
          description: "Please wait for data to load before exporting",
          variant: "destructive",
        });
        return;
      }

      await generatePDF({
        skuMovements: [], // No longer using SKU movements
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

  // Loading state
  if (stockLoading || topMoversLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (stockError || topMoversError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          Error loading reports: {stockError?.message || topMoversError?.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReportControls
        reportType={reportType}
        onReportTypeChange={setReportType}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onExportReport={handleExportReport}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="stock-analysis" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Stock Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="product-sales" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Product Sales</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StockLevelsChart skuStockLevels={skuStockLevels} />
          </div>
          <div className="mt-6">
            <TopMoversSection topMovers={topMovers} />
          </div>
        </TabsContent>

        <TabsContent value="stock-analysis" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StockLevelsChart skuStockLevels={skuStockLevels} />
          </div>
          <div className="mt-6">
            <TopMoversSection topMovers={topMovers} />
          </div>
        </TabsContent>

        <TabsContent value="product-sales" className="mt-6">
          <ProductSalesAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryReports;
