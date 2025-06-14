
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProductWithInventory } from "@/hooks/useProducts";
import { useTopMovingProducts } from "@/hooks/useInventoryAnalytics";
import { useSkuStockLevels } from "@/hooks/useSkuAnalytics";
import { useInventoryReportPDF } from "@/hooks/useInventoryReportPDF";
import { useToast } from "@/hooks/use-toast";
import ReportControls from "./ReportControls";
import StockLevelsChart from "./StockLevelsChart";
import TopMoversSection from "./TopMoversSection";

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockLevelsChart skuStockLevels={skuStockLevels} />
      </div>

      <TopMoversSection topMovers={topMovers} />
    </div>
  );
};

export default InventoryReports;
