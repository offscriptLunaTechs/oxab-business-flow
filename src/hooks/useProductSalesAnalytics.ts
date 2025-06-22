
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay } from 'date-fns';

export interface ProductSalesCustomer {
  customer_id: string;
  customer_name: string;
  customer_code: string;
  customer_type: 'wholesale' | 'retail';
  total_quantity: number;
  total_amount: number;
  invoice_count: number;
  last_purchase_date: string;
}

export interface ProductSalesTimeline {
  date: string;
  quantity: number;
  revenue: number;
  invoice_count: number;
}

export interface ProductSalesTransaction {
  invoice_id: string;
  customer_name: string;
  customer_code: string;
  date: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ProductSalesAnalytics {
  product_id: string;
  product_name: string;
  product_sku: string;
  period_start: string;
  period_end: string;
  total_quantity_sold: number;
  total_revenue: number;
  total_invoices: number;
  unique_customers: number;
  average_price: number;
  customers: ProductSalesCustomer[];
  timeline: ProductSalesTimeline[];
  recent_transactions: ProductSalesTransaction[];
}

export const useProductSalesAnalytics = (
  productId: string,
  startDate: Date,
  endDate: Date,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['product-sales-analytics', productId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async (): Promise<ProductSalesAnalytics | null> => {
      if (!productId) return null;

      console.log('Fetching product sales analytics for:', productId);

      const startDateTime = startOfDay(startDate).toISOString();
      const endDateTime = endOfDay(endDate).toISOString();

      // Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, sku')
        .eq('id', productId)
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        throw new Error(`Failed to fetch product: ${productError.message}`);
      }

      // Get invoice items with invoice and customer details
      const { data: invoiceItems, error: itemsError } = await supabase
        .from('invoice_items')
        .select(`
          *,
          invoices!inner (
            id,
            date,
            customer_id,
            customers!inner (
              id,
              name,
              code,
              customer_type
            )
          )
        `)
        .eq('product_id', productId)
        .gte('invoices.date', startDateTime.split('T')[0])
        .lte('invoices.date', endDateTime.split('T')[0]);

      if (itemsError) {
        console.error('Error fetching invoice items:', itemsError);
        throw new Error(`Failed to fetch sales data: ${itemsError.message}`);
      }

      if (!invoiceItems || invoiceItems.length === 0) {
        return {
          product_id: productId,
          product_name: product.name,
          product_sku: product.sku,
          period_start: startDateTime,
          period_end: endDateTime,
          total_quantity_sold: 0,
          total_revenue: 0,
          total_invoices: 0,
          unique_customers: 0,
          average_price: 0,
          customers: [],
          timeline: [],
          recent_transactions: []
        };
      }

      // Calculate totals
      const totalQuantitySold = invoiceItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalRevenue = invoiceItems.reduce((sum, item) => sum + item.total, 0);
      const totalInvoices = new Set(invoiceItems.map(item => item.invoice_id)).size;
      const uniqueCustomers = new Set(invoiceItems.map(item => item.invoices.customer_id)).size;
      const averagePrice = totalQuantitySold > 0 ? totalRevenue / totalQuantitySold : 0;

      // Group by customers
      const customerMap = new Map<string, ProductSalesCustomer>();
      invoiceItems.forEach(item => {
        const customer = item.invoices.customers;
        const customerId = customer.id;
        
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            customer_id: customerId,
            customer_name: customer.name,
            customer_code: customer.code,
            customer_type: customer.customer_type as 'wholesale' | 'retail',
            total_quantity: 0,
            total_amount: 0,
            invoice_count: 0,
            last_purchase_date: item.invoices.date
          });
        }
        
        const customerData = customerMap.get(customerId)!;
        customerData.total_quantity += item.quantity;
        customerData.total_amount += item.total;
        customerData.invoice_count += 1;
        
        // Update last purchase date if this one is more recent
        if (item.invoices.date > customerData.last_purchase_date) {
          customerData.last_purchase_date = item.invoices.date;
        }
      });

      const customers = Array.from(customerMap.values())
        .sort((a, b) => b.total_amount - a.total_amount);

      // Create timeline (group by date)
      const timelineMap = new Map<string, ProductSalesTimeline>();
      invoiceItems.forEach(item => {
        const date = item.invoices.date;
        
        if (!timelineMap.has(date)) {
          timelineMap.set(date, {
            date,
            quantity: 0,
            revenue: 0,
            invoice_count: 0
          });
        }
        
        const timelineData = timelineMap.get(date)!;
        timelineData.quantity += item.quantity;
        timelineData.revenue += item.total;
        timelineData.invoice_count += 1;
      });

      const timeline = Array.from(timelineMap.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Recent transactions (last 10)
      const recentTransactions: ProductSalesTransaction[] = invoiceItems
        .map(item => ({
          invoice_id: item.invoice_id,
          customer_name: item.invoices.customers.name,
          customer_code: item.invoices.customers.code,
          date: item.invoices.date,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      console.log('Product sales analytics loaded:', {
        totalQuantitySold,
        totalRevenue,
        totalInvoices,
        uniqueCustomers
      });

      return {
        product_id: productId,
        product_name: product.name,
        product_sku: product.sku,
        period_start: startDateTime,
        period_end: endDateTime,
        total_quantity_sold: totalQuantitySold,
        total_revenue: totalRevenue,
        total_invoices: totalInvoices,
        unique_customers: uniqueCustomers,
        average_price: averagePrice,
        customers,
        timeline,
        recent_transactions: recentTransactions
      };
    },
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
