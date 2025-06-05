
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { subDays } from 'date-fns';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerStatement } from '@/hooks/useCustomerStatement';
import { StatementFilters } from './StatementFilters';
import { StatementHeader } from './StatementHeader';
import { StatementSummaryCards } from './StatementSummaryCards';
import { StatementActions } from './StatementActions';
import { StatementInvoiceList } from './StatementInvoiceList';

export const AccountSummary = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { data: customers = [] } = useCustomers();
  const statementData = useCustomerStatement(selectedCustomerId, startDate, endDate);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="space-y-6">
      {/* Customer Selection and Filters */}
      <StatementFilters
        customers={customers}
        selectedCustomerId={selectedCustomerId}
        startDate={startDate}
        endDate={endDate}
        onCustomerChange={setSelectedCustomerId}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* Customer Statement */}
      {selectedCustomer ? (
        <>
          {/* Statement Header */}
          <StatementHeader
            customer={selectedCustomer}
            startDate={startDate}
            endDate={endDate}
            openingBalance={statementData.openingBalance}
          />

          {/* Summary Cards */}
          <StatementSummaryCards
            totalOutstanding={statementData.totalOutstanding}
            totalPaid={statementData.totalPaid}
            totalInvoices={statementData.invoices.length}
            overdueInvoices={statementData.invoices.filter(inv => inv.isOverdue).length}
          />

          {/* Action Buttons */}
          <StatementActions
            customer={selectedCustomer}
            invoices={statementData.invoices}
            startDate={startDate}
            endDate={endDate}
            totalOutstanding={statementData.totalOutstanding}
            openingBalance={statementData.openingBalance}
          />

          {/* Invoice List */}
          <StatementInvoiceList invoices={statementData.invoices} />
        </>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-gray-500">Please select a customer to view their statement</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
