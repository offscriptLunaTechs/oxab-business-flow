
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface StatementActionsProps {
  customer: any;
  invoices: any[];
  startDate: Date;
  endDate: Date;
  totalOutstanding: number;
  openingBalance: number;
}

// Dynamically import PDF dependencies to avoid bundling issues
const loadPdfDependencies = async () => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in browser environment');
    }

    const [reactPdfModule, fileSaverModule] = await Promise.all([
      import('@react-pdf/renderer').catch(() => {
        throw new Error('PDF renderer not available');
      }),
      import('file-saver').catch(() => {
        throw new Error('File saver not available');
      })
    ]);
    
    const customerStatementPdfModule = await import('./CustomerStatementPDF').catch(() => {
      throw new Error('Customer statement PDF component not available');
    });
    
    return {
      pdf: reactPdfModule.pdf,
      saveAs: fileSaverModule.saveAs,
      CustomerStatementPDF: customerStatementPdfModule.default
    };
  } catch (error) {
    logger.error('Failed to load PDF dependencies for customer statement', error);
    throw new Error('PDF functionality is not available. Please try refreshing the page.');
  }
};

export const StatementActions: React.FC<StatementActionsProps> = ({
  customer,
  invoices,
  startDate,
  endDate,
  totalOutstanding,
  openingBalance
}) => {
  const { toast } = useToast();

  const handleEmailStatement = () => {
    toast({
      title: "Email Statement",
      description: "Email functionality will be implemented soon",
    });
  };

  const handleDownloadPDF = async () => {
    if (!customer || invoices.length === 0) return;
    
    try {
      console.log('Generating customer statement PDF...');
      
      // Dynamically load PDF dependencies
      const { pdf, saveAs, CustomerStatementPDF } = await loadPdfDependencies();
      
      const pdfDocument = (
        <CustomerStatementPDF
          customer={customer}
          invoices={invoices}
          startDate={startDate}
          endDate={endDate}
          totalOutstanding={totalOutstanding}
          openingBalance={openingBalance}
        />
      );
      
      const blob = await pdf(pdfDocument).toBlob();
      
      const filename = `statement-${customer.code}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      saveAs(blob, filename);
      
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      toast({
        title: "Error",
        description: errorMessage.includes('PDF functionality is not available') 
          ? "PDF generation is temporarily unavailable. Please try refreshing the page."
          : "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {customer && invoices.length > 0 && (
            <Button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          )}
          
          <Button 
            onClick={handleEmailStatement} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email Statement
          </Button>
          
          <Button 
            onClick={() => window.print()} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Statement
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
