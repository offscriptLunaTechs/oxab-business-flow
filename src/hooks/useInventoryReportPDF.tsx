
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import InventoryReportPDF from '@/components/inventory/InventoryReportPDF';
import { SkuMonthlyMovement, SkuStockLevel } from '@/hooks/useSkuAnalytics';
import { TopMovingProduct } from '@/hooks/useInventoryAnalytics';
import { logger } from '@/utils/logger';

interface GenerateInventoryReportPDFParams {
  skuMovements: SkuMonthlyMovement[];
  skuStockLevels: SkuStockLevel[];
  topMovers: TopMovingProduct[];
}

export const generateInventoryReportPDF = async ({
  skuMovements,
  skuStockLevels,
  topMovers
}: GenerateInventoryReportPDFParams) => {
  try {
    logger.info('Starting inventory report PDF generation');
    
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create the PDF blob with error handling
    const blob = await pdf(
      <InventoryReportPDF
        skuMovements={skuMovements}
        skuStockLevels={skuStockLevels}
        topMovers={topMovers}
        reportDate={reportDate}
      />
    ).toBlob();

    // Download the file
    const fileName = `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`;
    saveAs(blob, fileName);

    logger.info('Inventory report PDF generated successfully', { fileName });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error generating inventory report PDF', { error: errorMessage });
    throw new Error(`Failed to generate PDF: ${errorMessage}`);
  }
};

export const useInventoryReportPDF = () => {
  return {
    generatePDF: generateInventoryReportPDF,
  };
};
