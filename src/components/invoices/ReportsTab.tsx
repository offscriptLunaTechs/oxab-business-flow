
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OutstandingInvoice } from '@/hooks/useOutstandingInvoices';

interface ReportsTabProps {
  outstandingInvoices: OutstandingInvoice[];
  isPDFGenerating: boolean;
  onDownloadReport: () => void;
}

const ReportsTab = ({
  outstandingInvoices,
  isPDFGenerating,
  onDownloadReport,
}: ReportsTabProps) => {
  const navigate = useNavigate();

  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.outstanding_amount, 0);
  const averageOutstanding = outstandingInvoices.length > 0 ? 
    totalOutstanding / outstandingInvoices.length : 0;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={onDownloadReport}
              disabled={isPDFGenerating}
            >
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <span>Outstanding Invoices Report</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/reports/outstanding-invoices')}
            >
              <FileText className="h-6 w-6" />
              <span>Detailed Reports Dashboard</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-600">
                  KWD {totalOutstanding.toFixed(3)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Count</p>
                <p className="text-2xl font-bold">{outstandingInvoices.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Outstanding</p>
                <p className="text-2xl font-bold">
                  KWD {averageOutstanding.toFixed(3)}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsTab;
