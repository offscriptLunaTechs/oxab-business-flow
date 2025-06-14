
import { supabase } from '@/integrations/supabase/client';

export const useCustomerPricing = () => {
  const getCustomerPrice = async (customerId: string, productId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_pricing')
        .select('price')
        .eq('customer_id', customerId)
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('effective_date', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;
      return data.price;
    } catch (error) {
      console.warn('Failed to fetch customer price:', error);
      return null;
    }
  };

  return { getCustomerPrice };
};
