
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import InventoryReportPDF from '@/components/inventory/InventoryReportPDF';
import { SkuMonthlyMovement, SkuStockLevel } from '@/hooks/useSkuAnalytics';
import { TopMovingProduct } from '@/hooks/useInventoryAnalytics';

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
    console.log('Starting inventory report PDF generation...');
    
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create the PDF blob
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

    console.log('Inventory report PDF generated successfully');
  } catch (error) {
    console.error('Error generating inventory report PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

export const useInventoryReportPDF = () => {
  return {
    generatePDF: generateInventoryReportPDF,
  };
};
