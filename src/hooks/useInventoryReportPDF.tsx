
import React from 'react';
import { SkuMonthlyMovement, SkuStockLevel } from '@/hooks/useSkuAnalytics';
import { TopMovingProduct } from '@/hooks/useInventoryAnalytics';
import { logger } from '@/utils/logger';

interface GenerateInventoryReportPDFParams {
  skuMovements: SkuMonthlyMovement[];
  skuStockLevels: SkuStockLevel[];
  topMovers: TopMovingProduct[];
}

// Simplified dynamic import approach
const loadPdfDependencies = async () => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in browser environment');
    }

    // Import modules individually
    const reactPdfModule = await import('@react-pdf/renderer');
    const fileSaverModule = await import('file-saver');
    const inventoryReportPdfModule = await import('@/components/inventory/InventoryReportPDF');
    
    return {
      pdf: reactPdfModule.pdf,
      saveAs: fileSaverModule.saveAs,
      InventoryReportPDF: inventoryReportPdfModule.default
    };
  } catch (error) {
    logger.error('Failed to load PDF dependencies for inventory report', error);
    throw new Error('PDF functionality is not available for inventory reports. Please try again or contact support.');
  }
};

export const generateInventoryReportPDF = async ({
  skuMovements,
  skuStockLevels,
  topMovers
}: GenerateInventoryReportPDFParams) => {
  try {
    logger.info('Starting dynamic inventory report PDF generation');
    
    // Load dependencies
    const { pdf, saveAs, InventoryReportPDF } = await loadPdfDependencies();
    
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate PDF
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
    throw new Error('Failed to generate PDF report. Please try again.');
  }
};

export const useInventoryReportPDF = () => {
  return {
    generatePDF: generateInventoryReportPDF,
  };
};
