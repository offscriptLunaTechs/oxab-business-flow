
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface StatementHeaderProps {
  customer: any;
  startDate: Date;
  endDate: Date;
  openingBalance: number;
}

export const StatementHeader: React.FC<StatementHeaderProps> = ({
  customer,
  startDate,
  endDate,
  openingBalance
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {customer.name} ({customer.code})
          </h2>
          <p className="text-gray-600">
            Period: {format(startDate, 'dd/MM/yyyy')} to {format(endDate, 'dd/MM/yyyy')}
          </p>
          {customer.address && (
            <p className="text-sm text-gray-500 mt-1">{customer.address}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Opening Balance</div>
          <div className="text-lg font-semibold">KWD {openingBalance.toFixed(3)}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);
