
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

const loadPdfDependencies = async () => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in browser environment');
    }

    // Dynamic imports with proper error handling and timeout
    const importTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('PDF import timeout')), 10000)
    );

    const imports = await Promise.race([
      Promise.all([
        import('@react-pdf/renderer').catch(err => {
          console.error('Failed to load @react-pdf/renderer:', err);
          throw new Error('PDF library failed to load. Please refresh and try again.');
        }),
        import('file-saver').catch(err => {
          console.error('Failed to load file-saver:', err);
          throw new Error('File saving library failed to load. Please refresh and try again.');
        }),
        import('./CustomerStatementPDF').catch(err => {
          console.error('Failed to load CustomerStatementPDF:', err);
          throw new Error('PDF component failed to load. Please refresh and try again.');
        })
      ]),
      importTimeout
    ]) as [typeof import('@react-pdf/renderer'), typeof import('file-saver'), typeof import('./CustomerStatementPDF')];
    
    const [reactPdfModule, fileSaverModule, customerStatementPdfModule] = imports;
    
    return {
      pdf: reactPdfModule.pdf,
      saveAs: fileSaverModule.saveAs,
      CustomerStatementPDF: customerStatementPdfModule.default
    };
  } catch (error) {
    logger.error('Failed to load PDF dependencies for customer statement', error);
    throw new Error('PDF functionality is not available. Please try again or contact support.');
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
      
      // Load dependencies
      const { pdf, saveAs, CustomerStatementPDF } = await loadPdfDependencies();
      
      const blob = await pdf(
        <CustomerStatementPDF
          customer={customer}
          invoices={invoices}
          startDate={startDate}
          endDate={endDate}
          totalOutstanding={totalOutstanding}
          openingBalance={openingBalance}
        />
      ).toBlob();
      
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
        description: "Failed to generate PDF. Please try again.",
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
