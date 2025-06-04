
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerPricing {
  id: string;
  customer_id: string;
  product_id: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export const useCustomerPricing = (customerId?: string) => {
  return useQuery({
    queryKey: ['customer-pricing', customerId],
    queryFn: async (): Promise<CustomerPricing[]> => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from('customer_pricing')
        .select('*')
        .eq('customer_id', customerId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
  });
};

export const useCustomerProductPrice = (customerId?: string, productId?: string) => {
  return useQuery({
    queryKey: ['customer-product-price', customerId, productId],
    queryFn: async (): Promise<number | null> => {
      if (!customerId || !productId) return null;
      
      // First check if there's a customer-specific price
      const { data: customerPrice, error: customerPriceError } = await supabase
        .from('customer_pricing')
        .select('price')
        .eq('customer_id', customerId)
        .eq('product_id', productId)
        .single();
      
      if (customerPrice && !customerPriceError) {
        return customerPrice.price;
      }
      
      // Fall back to base price
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('base_price')
        .eq('id', productId)
        .single();
      
      if (productError) throw productError;
      return product.base_price;
    },
    enabled: !!customerId && !!productId,
  });
};
