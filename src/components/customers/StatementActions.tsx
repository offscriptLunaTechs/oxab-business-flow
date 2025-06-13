
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, Printer } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import CustomerStatementPDF from './CustomerStatementPDF';
import { useToast } from '@/hooks/use-toast';

interface StatementActionsProps {
  customer: any;
  invoices: any[];
  startDate: Date;
  endDate: Date;
  totalOutstanding: number;
  openingBalance: number;
}

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
      
      // Create the PDF document - pass component directly
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
      toast({
        title: "Error",
        description: "Failed to generate PDF",
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
