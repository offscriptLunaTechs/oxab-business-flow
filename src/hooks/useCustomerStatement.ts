
import { useMemo } from 'react';
import { useInvoices } from './useInvoices';
import { useCustomer } from './useCustomers';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceWithPayments {
  id: string;
  customer_id: string;
  date: string;
  due_date: string;
  total: number;
  status: string;
  allocated_amount: number;
  outstanding_amount: number;
  payment_status: 'paid' | 'partially_paid' | 'pending' | 'overdue';
  isOverdue: boolean;
  runningBalance: number;
}

export const useCustomerStatement = (
  customerId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const { data: customer } = useCustomer(customerId);

  // Get invoices with payment allocations
  const { data: invoicesWithPayments = [], isLoading } = useQuery({
    queryKey: ['customer-statement-invoices', customerId, startDate, endDate],
    queryFn: async () => {
      if (!customerId) return [];

      let query = supabase
        .from('invoices')
        .select(`
          *,
          invoice_payments (
            allocated_amount
          )
        `)
        .eq('customer_id', customerId)
        .order('date', { ascending: true });

      if (startDate) {
        query = query.gte('date', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        query = query.lte('date', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    },
    enabled: !!customerId,
  });

  const statementData = useMemo(() => {
    if (!customerId || isLoading) {
      return {
        invoices: [],
        openingBalance: 0,
        totalOutstanding: 0,
        totalPaid: 0,
        customer
      };
    }

    // Process invoices with payment data
    let runningBalance = 0;
    const processedInvoices: InvoiceWithPayments[] = invoicesWithPayments.map(invoice => {
      // Calculate total allocated amount for this invoice
      const allocatedAmount = (invoice.invoice_payments || []).reduce(
        (sum: number, payment: any) => sum + Number(payment.allocated_amount), 
        0
      );

      // Calculate outstanding amount
      const outstandingAmount = Math.max(0, Number(invoice.total) - allocatedAmount);
      
      // Determine payment status
      let paymentStatus: 'paid' | 'partially_paid' | 'pending' | 'overdue';
      const isOverdue = new Date(invoice.due_date) < new Date() && outstandingAmount > 0;
      
      if (allocatedAmount >= Number(invoice.total)) {
        paymentStatus = 'paid';
      } else if (allocatedAmount > 0) {
        paymentStatus = 'partially_paid';
      } else if (isOverdue) {
        paymentStatus = 'overdue';
      } else {
        paymentStatus = 'pending';
      }

      // Update running balance (only add outstanding amounts)
      runningBalance += outstandingAmount;

      return {
        ...invoice,
        allocated_amount: allocatedAmount,
        outstanding_amount: outstandingAmount,
        payment_status: paymentStatus,
        isOverdue,
        runningBalance,
        total: Number(invoice.total)
      };
    });

    // Calculate totals
    const totalOutstanding = processedInvoices.reduce((sum, inv) => sum + inv.outstanding_amount, 0);
    const totalPaid = processedInvoices.reduce((sum, inv) => sum + inv.allocated_amount, 0);

    return {
      invoices: processedInvoices,
      openingBalance: 0, // Could be calculated from previous periods
      totalOutstanding,
      totalPaid,
      customer
    };
  }, [invoicesWithPayments, customerId, customer, isLoading]);

  return statementData;
};
