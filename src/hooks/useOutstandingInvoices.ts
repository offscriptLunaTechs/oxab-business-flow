
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OutstandingInvoice {
  invoice_id: string;
  customer_id: string;
  customer_name: string;
  customer_code: string;
  customer_type: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  days_overdue: number;
  aging_bucket: string;
  status: string;
  payment_status: string;
}

export interface CustomerSummary {
  customer_id: string;
  customer_name: string;
  customer_code: string;
  total_outstanding: number;
  invoice_count: number;
  oldest_invoice_date: string;
  invoices: OutstandingInvoice[];
}

export interface OutstandingInvoicesFilters {
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
}

export const useOutstandingInvoices = (filters?: OutstandingInvoicesFilters) => {
  return useQuery({
    queryKey: ['outstanding-invoices', filters],
    queryFn: async (): Promise<OutstandingInvoice[]> => {
      console.log('Fetching outstanding invoices with filters:', filters);
      
      try {
        // Fetch invoices that are not paid
        let query = supabase
          .from('invoices')
          .select(`
            id,
            customer_id,
            date,
            due_date,
            total,
            status,
            customers!invoices_customer_id_fkey(
              name,
              code,
              customer_type
            )
          `)
          .neq('status', 'paid')
          .order('due_date', { ascending: true });

        // Apply filters
        if (filters?.customerId) {
          query = query.eq('customer_id', filters.customerId);
        }
        if (filters?.startDate) {
          query = query.gte('date', filters.startDate.toISOString().split('T')[0]);
        }
        if (filters?.endDate) {
          query = query.lte('date', filters.endDate.toISOString().split('T')[0]);
        }

        const { data: invoices, error } = await query;
        
        if (error) {
          console.error('Outstanding invoices error:', error);
          throw new Error(`Failed to fetch outstanding invoices: ${error.message}`);
        }

        // Calculate paid amounts for each invoice
        const invoiceIds = invoices?.map(inv => inv.id) || [];
        
        const { data: payments } = await supabase
          .from('invoice_payments')
          .select('invoice_id, allocated_amount')
          .in('invoice_id', invoiceIds);

        const paymentMap = new Map();
        payments?.forEach(payment => {
          const currentPaid = paymentMap.get(payment.invoice_id) || 0;
          paymentMap.set(payment.invoice_id, currentPaid + payment.allocated_amount);
        });

        // Transform and calculate outstanding amounts
        const outstandingInvoices: OutstandingInvoice[] = (invoices || []).map(invoice => {
          const paidAmount = paymentMap.get(invoice.id) || 0;
          const outstandingAmount = invoice.total - paidAmount;
          
          // Skip if fully paid or meets minimum amount filter
          if (outstandingAmount <= 0 || (filters?.minAmount && outstandingAmount < filters.minAmount)) {
            return null;
          }

          const dueDate = new Date(invoice.due_date);
          const today = new Date();
          const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
          
          // Calculate aging bucket
          let agingBucket = 'Current';
          if (daysOverdue > 0) {
            if (daysOverdue <= 30) agingBucket = '1-30 Days';
            else if (daysOverdue <= 60) agingBucket = '31-60 Days';
            else if (daysOverdue <= 90) agingBucket = '61-90 Days';
            else agingBucket = '90+ Days';
          }

          // Determine payment status
          let paymentStatus = 'pending';
          if (paidAmount > 0 && paidAmount < invoice.total) {
            paymentStatus = 'partially_paid';
          } else if (daysOverdue > 0) {
            paymentStatus = 'overdue';
          }

          return {
            invoice_id: invoice.id,
            customer_id: invoice.customer_id,
            customer_name: invoice.customers?.name || 'Unknown',
            customer_code: invoice.customers?.code || '',
            customer_type: invoice.customers?.customer_type || 'wholesale',
            invoice_date: invoice.date,
            due_date: invoice.due_date,
            total_amount: invoice.total,
            paid_amount: paidAmount,
            outstanding_amount: outstandingAmount,
            days_overdue: daysOverdue,
            aging_bucket: agingBucket,
            status: invoice.status,
            payment_status: paymentStatus,
          };
        }).filter(Boolean) as OutstandingInvoice[];

        console.log('Outstanding invoices loaded:', outstandingInvoices.length, 'records');
        return outstandingInvoices;
      } catch (err) {
        console.error('Unexpected error in outstanding invoices query:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook to get customer summaries for the report
export const useCustomerSummaries = (invoices: OutstandingInvoice[]): CustomerSummary[] => {
  const customerMap = new Map<string, CustomerSummary>();
  
  invoices.forEach(invoice => {
    const customerId = invoice.customer_id;
    
    if (!customerMap.has(customerId)) {
      customerMap.set(customerId, {
        customer_id: customerId,
        customer_name: invoice.customer_name,
        customer_code: invoice.customer_code,
        total_outstanding: 0,
        invoice_count: 0,
        oldest_invoice_date: invoice.invoice_date,
        invoices: [],
      });
    }
    
    const summary = customerMap.get(customerId)!;
    summary.total_outstanding += invoice.outstanding_amount;
    summary.invoice_count += 1;
    summary.invoices.push(invoice);
    
    // Update oldest invoice date
    if (new Date(invoice.invoice_date) < new Date(summary.oldest_invoice_date)) {
      summary.oldest_invoice_date = invoice.invoice_date;
    }
  });
  
  return Array.from(customerMap.values()).sort((a, b) => b.total_outstanding - a.total_outstanding);
};
