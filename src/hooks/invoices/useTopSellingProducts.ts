
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTopSellingProducts = () => {
  const [topSellingProducts, setTopSellingProducts] = useState<string[]>([]);

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('invoice_items')
          .select(`
            product_id,
            quantity,
            invoices!inner(date)
          `)
          .gte('invoices.date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('invoices.date', { ascending: false });

        if (error) {
          console.warn('Could not fetch top-selling products:', error);
          return;
        }

        // Group by product_id and sum quantities
        const productSales = new Map<string, number>();
        data?.forEach(item => {
          const current = productSales.get(item.product_id) || 0;
          productSales.set(item.product_id, current + item.quantity);
        });

        // Sort by quantity sold and get top 20
        const sortedProducts = Array.from(productSales.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([productId]) => productId);

        setTopSellingProducts(sortedProducts);
      } catch (error) {
        console.warn('Error fetching top-selling products:', error);
      }
    };

    fetchTopSellingProducts();
  }, []);

  return topSellingProducts;
};
