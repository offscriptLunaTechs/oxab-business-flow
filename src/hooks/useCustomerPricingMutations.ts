
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreatePricingData {
  customer_id: string;
  product_id: string;
  price: number;
  effective_date?: string;
  expires_date?: string;
  is_active?: boolean;
}

interface UpdatePricingData extends Partial<CreatePricingData> {
  id: string;
}

export const useCreateCustomerPricing = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePricingData) => {
      const { data: result, error } = await supabase
        .from('customer_pricing')
        .insert({
          ...data,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-pricing'] });
      toast({
        title: "Success",
        description: "Custom pricing created successfully",
      });
    },
    onError: (error) => {
      console.error('Create pricing error:', error);
      toast({
        title: "Error",
        description: "Failed to create custom pricing",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCustomerPricing = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdatePricingData) => {
      const { data: result, error } = await supabase
        .from('customer_pricing')
        .update({
          ...data,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-pricing'] });
      toast({
        title: "Success",
        description: "Custom pricing updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update pricing error:', error);
      toast({
        title: "Error",
        description: "Failed to update custom pricing",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCustomerPricing = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customer_pricing')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-pricing'] });
      toast({
        title: "Success",
        description: "Custom pricing deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete pricing error:', error);
      toast({
        title: "Error",
        description: "Failed to delete custom pricing",
        variant: "destructive",
      });
    },
  });
};
