import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerStatement } from '@/hooks/useCustomerStatement';
import { useCustomerPayments, useCustomerOutstandingBalance } from '@/hooks/useCustomerPayments';
import { usePaymentDataSync } from '@/hooks/usePaymentDataSync';
import { StatementSummaryCards } from './StatementSummaryCards';
import { StatementInvoiceList } from './StatementInvoiceList';
import { PaymentEntry } from './PaymentEntry';
import { PaymentHistory } from './PaymentHistory';
import { StatementFilters } from './StatementFilters';
import { StatementActions } from './StatementActions';
import { subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const CustomerAccountSummary = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 90));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Ensure payment data is synchronized
  const { refreshPaymentData } = usePaymentDataSync();

  const { data: customers = [] } = useCustomers();
  const statementData = useCustomerStatement(selectedCustomerId, startDate, endDate);
  const { data: payments = [] } = useCustomerPayments(selectedCustomerId);
  const { data: outstandingBalance = 0 } = useCustomerOutstandingBalance(selectedCustomerId);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Predefined date range options
  const setDateRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case 'last30':
        setStartDate(subDays(now, 30));
        setEndDate(now);
        break;
      case 'last90':
        setStartDate(subDays(now, 90));
        setEndDate(now);
        break;
      case 'thisMonth':
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        setStartDate(startOfMonth(lastMonth));
        setEndDate(endOfMonth(lastMonth));
        break;
      case 'thisYear':
        setStartDate(startOfYear(now));
        setEndDate(now);
        break;
      case 'allTime':
        setStartDate(new Date(2020, 0, 1)); // Set a reasonable start date
        setEndDate(now);
        break;
    }
  };

  // New: Set range for all unpaid invoices
  const setAllUnpaidRange = async () => {
    if (!selectedCustomerId) {
      toast({ title: "Select a customer", description: "Please select a customer first.", variant: "destructive" });
      return;
    }

    // Query earliest unpaid invoice date for this customer
    const { data, error } = await supabase
      .from('invoices')
      .select('date')
      .eq('customer_id', selectedCustomerId)
      .neq('status', 'paid')
      .order('date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      toast({ title: "Error", description: "Failed to load unpaid invoices", variant: "destructive" });
      return;
    }

    if (!data) {
      toast({ title: "No unpaid invoices", description: "This customer has no unpaid invoices." });
      return;
    }

    setStartDate(new Date(data.date));
    setEndDate(new Date());
    toast({
      title: "All unpaid",
      description: "Showing unpaid invoices from " + new Date(data.date).toLocaleDateString() + " to today.",
    });
  };

  const handlePaymentAdded = () => {
    // Refresh all related queries after payment is added
    refreshPaymentData();
    queryClient.invalidateQueries({ queryKey: ['customer-payments', selectedCustomerId] });
    queryClient.invalidateQueries({ queryKey: ['customer-outstanding-balance', selectedCustomerId] });
    queryClient.invalidateQueries({ queryKey: ['customer-statement-invoices', selectedCustomerId] });
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

                {/* Enhanced Summary Cards with Hybrid Calculation */}
                <StatementSummaryCards
                  totalOutstanding={statementData.totalOutstanding}
                  totalPaid={statementData.totalPaid}
                  totalInvoices={statementData.invoices.length}
                  overdueInvoices={statementData.invoices.filter(inv => inv.payment_status === 'overdue').length}
                />

                {/* Statement Generation and Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Generate Account Statement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Quick Date Range Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quick Date Ranges</label>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => setDateRange('last30')}>
                          Last 30 Days
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDateRange('last90')}>
                          Last 90 Days
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDateRange('thisMonth')}>
                          This Month
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDateRange('lastMonth')}>
                          Last Month
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDateRange('thisYear')}>
                          This Year
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDateRange('allTime')}>
                          All Time
                        </Button>
                        <Button size="sm" variant="default" onClick={setAllUnpaidRange}>
                          All unpaid
                        </Button>
                      </div>
                    </div>
                    
                    <StatementFilters
                      customers={[selectedCustomer]}
                      selectedCustomerId={selectedCustomerId}
                      startDate={startDate}
                      endDate={endDate}
                      onCustomerChange={() => {}} // Disabled since customer is already selected
                      onStartDateChange={(date) => date && setStartDate(date)}
                      onEndDateChange={(date) => date && setEndDate(date)}
                    />
                    
                    {statementData.invoices.length > 0 && (
                      <StatementActions
                        customer={selectedCustomer}
                        invoices={statementData.invoices}
                        startDate={startDate}
                        endDate={endDate}
                        totalOutstanding={statementData.totalOutstanding}
                        openingBalance={statementData.openingBalance}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Payment Entry */}
                <PaymentEntry
                  customerId={selectedCustomerId}
                  customerName={selectedCustomer.name}
                  onPaymentAdded={handlePaymentAdded}
                />

                {/* Payment History */}
                <PaymentHistory payments={payments} />

                {/* Invoice List with Enhanced Payment Status */}
                <StatementInvoiceList invoices={statementData.invoices} />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
