
import React from 'react';
import { SkuMonthlyMovement, SkuStockLevel } from '@/hooks/useSkuAnalytics';
import { TopMovingProduct } from '@/hooks/useInventoryAnalytics';
import { logger } from '@/utils/logger';

interface GenerateInventoryReportPDFParams {
  skuMovements: SkuMonthlyMovement[];
  skuStockLevels: SkuStockLevel[];
  topMovers: TopMovingProduct[];
}

// Dynamically import PDF dependencies to avoid bundling issues
const loadPdfDependencies = async () => {
  try {
    const [
      { pdf }, 
      { saveAs }, 
      InventoryReportPDFModule
    ] = await Promise.all([
      import('@react-pdf/renderer'),
      import('file-saver'),
      import('@/components/inventory/InventoryReportPDF')
    ]);
    
    return {
      pdf,
      saveAs,
      InventoryReportPDF: InventoryReportPDFModule.default
    };
  } catch (error) {
    logger.error('Failed to load PDF dependencies for inventory report', error);
    throw new Error('PDF functionality is not available for inventory reports');
  }
};

export const generateInventoryReportPDF = async ({
  skuMovements,
  skuStockLevels,
  topMovers
}: GenerateInventoryReportPDFParams) => {
  try {
    logger.info('Starting dynamic inventory report PDF generation');
    
    // Dynamically load PDF dependencies
    const { pdf, saveAs, InventoryReportPDF } = await loadPdfDependencies();
    
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create the PDF blob with error handling
    const blob = await pdf(
      React.createElement(InventoryReportPDF, {
        skuMovements,
        skuStockLevels,
        topMovers,
        reportDate
      })
    ).toBlob();

    // Download the file
    const fileName = `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`;
    saveAs(blob, fileName);

    logger.info('Inventory report PDF generated successfully', { fileName });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error generating inventory report PDF', { error: errorMessage });
    
    // Provide user-friendly error message
    if (errorMessage.includes('PDF functionality is not available')) {
      throw new Error('PDF generation is temporarily unavailable. Please try again later.');
    }
    
    throw new Error(`Failed to generate PDF: ${errorMessage}`);
  }
};

export const useInventoryReportPDF = () => {
  return {
    generatePDF: generateInventoryReportPDF,
  };
};
