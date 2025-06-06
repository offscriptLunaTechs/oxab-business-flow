
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerPricing {
  id: string;
  customer_id: string;
  product_id: string;
  price: number;
  effective_date: string | null;
  expires_date: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export const useCustomerPricing = (customerId?: string) => {
  return useQuery({
    queryKey: ['customer-pricing', customerId],
    queryFn: async (): Promise<CustomerPricing[]> => {
      if (!customerId) {
        // Get all pricing entries if no customer specified
        const { data, error } = await supabase
          .from('customer_pricing')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      }
      
      const { data, error } = await supabase
        .from('customer_pricing')
        .select('*')
        .eq('customer_id', customerId);
      
      if (error) throw error;
      return data || [];
    },
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
