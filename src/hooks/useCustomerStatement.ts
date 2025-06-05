
import { useMemo } from 'react';
import { useInvoices } from './useInvoices';
import { useCustomer } from './useCustomers';

export const useCustomerStatement = (
  customerId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const { data: allInvoices = [] } = useInvoices();
  const { data: customer } = useCustomer(customerId);

  const statementData = useMemo(() => {
    if (!customerId) {
      return {
        invoices: [],
        openingBalance: 0,
        totalOutstanding: 0,
        totalPaid: 0
      };
    }

    // Filter invoices by customer and date range
    const customerInvoices = allInvoices.filter(invoice => {
      if (invoice.customer_id !== customerId) return false;
      const invoiceDate = new Date(invoice.date);
      if (startDate && invoiceDate < startDate) return false;
      if (endDate && invoiceDate > endDate) return false;
      return true;
    });

    // Sort by date for running balance calculation
    const sortedInvoices = customerInvoices.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate running balance
    let runningBalance = 0;
    const invoicesWithBalance = sortedInvoices.map(invoice => {
      const invoiceAmount = invoice.status === 'paid' ? 0 : invoice.total;
      runningBalance += invoiceAmount;
      
      return {
        ...invoice,
        runningBalance,
        isOverdue: new Date(invoice.due_date) < new Date() && invoice.status !== 'paid'
      };
    });

    const totalOutstanding = invoicesWithBalance
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const totalPaid = invoicesWithBalance
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    return {
      invoices: invoicesWithBalance,
      openingBalance: 0, // Could be calculated from previous periods
      totalOutstanding,
      totalPaid,
      customer
    };
  }, [allInvoices, customerId, startDate, endDate, customer]);

  return statementData;
};
