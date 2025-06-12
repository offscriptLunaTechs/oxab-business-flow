
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerStatement } from '@/hooks/useCustomerStatement';
import { useCustomerPayments, useCustomerOutstandingBalance } from '@/hooks/useCustomerPayments';
import { StatementSummaryCards } from './StatementSummaryCards';
import { StatementInvoiceList } from './StatementInvoiceList';
import { PaymentEntry } from './PaymentEntry';
import { PaymentHistory } from './PaymentHistory';
import { subDays } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

export const CustomerAccountSummary = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [startDate] = useState<Date>(subDays(new Date(), 90)); // Last 90 days
  const [endDate] = useState<Date>(new Date());
  const queryClient = useQueryClient();

  const { data: customers = [] } = useCustomers();
  const statementData = useCustomerStatement(selectedCustomerId, startDate, endDate);
  const { data: payments = [] } = useCustomerPayments(selectedCustomerId);
  const { data: outstandingBalance = 0 } = useCustomerOutstandingBalance(selectedCustomerId);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handlePaymentAdded = () => {
    // Refresh data after payment is added using queryClient
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    queryClient.invalidateQueries({ queryKey: ['customer-payments', selectedCustomerId] });
    queryClient.invalidateQueries({ queryKey: ['customer-outstanding-balance', selectedCustomerId] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Account Summary & Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Customer</label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer to view their account" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCustomer && (
              <>
                {/* Customer Info */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                  <p className="text-sm text-gray-600">
                    Code: {selectedCustomer.code} | Type: {selectedCustomer.customer_type}
                  </p>
                </div>

                {/* Enhanced Summary Cards with Outstanding Balance */}
                <StatementSummaryCards
                  totalOutstanding={outstandingBalance}
                  totalPaid={statementData.totalPaid}
                  totalInvoices={statementData.invoices.length}
                  overdueInvoices={statementData.invoices.filter(inv => inv.isOverdue).length}
                />

                {/* Payment Entry */}
                <PaymentEntry
                  customerId={selectedCustomerId}
                  customerName={selectedCustomer.name}
                  onPaymentAdded={handlePaymentAdded}
                />

                {/* Payment History */}
                <PaymentHistory payments={payments} />

                {/* Invoice List */}
                <StatementInvoiceList invoices={statementData.invoices} />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
