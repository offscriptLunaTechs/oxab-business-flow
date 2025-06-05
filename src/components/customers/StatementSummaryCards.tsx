
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatementSummaryCardsProps {
  totalOutstanding: number;
  totalPaid: number;
  totalInvoices: number;
  overdueInvoices: number;
}

export const StatementSummaryCards: React.FC<StatementSummaryCardsProps> = ({
  totalOutstanding,
  totalPaid,
  totalInvoices,
  overdueInvoices
}) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-red-600">
          KWD {totalOutstanding.toFixed(3)}
        </div>
        <p className="text-sm text-gray-600">Total Outstanding</p>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-green-600">
          KWD {totalPaid.toFixed(3)}
        </div>
        <p className="text-sm text-gray-600">Total Paid</p>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-blue-600">
          {totalInvoices}
        </div>
        <p className="text-sm text-gray-600">Total Invoices</p>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-yellow-600">
          {overdueInvoices}
        </div>
        <p className="text-sm text-gray-600">Overdue Invoices</p>
      </CardContent>
    </Card>
  </div>
);
