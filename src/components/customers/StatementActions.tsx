
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, Printer } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
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

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {customer && invoices.length > 0 && (
            <PDFDownloadLink
              document={
                <CustomerStatementPDF
                  customer={customer}
                  invoices={invoices}
                  startDate={startDate}
                  endDate={endDate}
                  totalOutstanding={totalOutstanding}
                  openingBalance={openingBalance}
                />
              }
              fileName={`statement-${customer.code}-${format(new Date(), 'yyyy-MM-dd')}.pdf`}
            >
              {({ loading }) => (
                <Button disabled={loading} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {loading ? 'Generating...' : 'Export PDF'}
                </Button>
              )}
            </PDFDownloadLink>
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
