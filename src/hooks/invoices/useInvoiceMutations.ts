
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types/invoice';
import { generateNextInvoiceId, applyCustomerPricing } from './useInvoiceHelpers';

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invoiceData: {
      customer_id: string;
      date: string;
      due_date: string;
      subtotal: number;
      tax: number;
      discount: number;
      total: number;
      status: string;
      notes?: string;
      items: {
        product_id: string;
        quantity: number;
        price: number;
        total: number;
      }[];
    }) => {
      const { items, ...invoice } = invoiceData;
      
      const invoiceId = await generateNextInvoiceId();
      console.log('Creating invoice with ID:', invoiceId);
      
      // Apply customer pricing but also save any manual price changes
      const itemsWithCustomPricing = await Promise.all(
        items.map(async (item) => {
          try {
            const { data: customPrice } = await supabase.rpc('get_customer_price', {
              p_customer_id: invoice.customer_id,
              p_product_id: item.product_id,
              p_date: invoice.date
            });
            
            const finalPrice = customPrice || item.price;
            
            // If the user manually changed the price from the default, save it as customer pricing
            if (item.price !== finalPrice && customPrice) {
              await supabase
                .from('customer_pricing')
                .upsert({
                  customer_id: invoice.customer_id,
                  product_id: item.product_id,
                  price: item.price,
                  effective_date: invoice.date,
                  is_active: true,
                  created_by: (await supabase.auth.getUser()).data.user?.id,
                  updated_by: (await supabase.auth.getUser()).data.user?.id,
                });
            }
            
            return {
              ...item,
              price: item.price, // Use the manually entered price
              total: item.price * item.quantity
            };
          } catch (error) {
            console.warn('Failed to get custom price for product:', item.product_id, error);
            return item;
          }
        })
      );
      
      const newSubtotal = itemsWithCustomPricing.reduce((sum, item) => sum + item.total, 0);
      const newTotal = newSubtotal + invoice.tax - invoice.discount;
      
      const { data: createdInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          ...invoice,
          id: invoiceId,
          subtotal: newSubtotal,
          total: newTotal
        })
        .select()
        .single();
      
      if (invoiceError) {
        console.error('Invoice creation error:', invoiceError);
        throw invoiceError;
      }

      const itemsWithInvoiceId = itemsWithCustomPricing.map(item => ({
        ...item,
        invoice_id: createdInvoice.id
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId);
      
      if (itemsError) {
        console.error('Invoice items creation error:', itemsError);
        throw itemsError;
      }

      console.log('Invoice created successfully:', createdInvoice);
      return createdInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['customer-pricing'] });
      toast({
        title: "Success",
        description: "Invoice created successfully with pricing saved",
      });
    },
    onError: (error) => {
      console.error('Create invoice mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      invoiceId, 
      invoiceData, 
      items 
    }: { 
      invoiceId: string; 
      invoiceData: Partial<Invoice>; 
      items?: {
        product_id: string;
        quantity: number;
        price: number;
        total: number;
      }[] 
    }) => {
      console.log('Updating invoice:', invoiceId, 'with data:', invoiceData);
      
      // Validate required fields
      if (!invoiceId) {
        throw new Error('Invoice ID is required');
      }

      // Save any manual price changes as customer pricing (if items and customer provided)
      if (items && invoiceData.customer_id && invoiceData.date) {
        console.log('Saving customer pricing updates...');
        try {
          await Promise.all(
            items.map(async (item) => {
              try {
                const { data: customPrice } = await supabase.rpc('get_customer_price', {
                  p_customer_id: invoiceData.customer_id,
                  p_product_id: item.product_id,
                  p_date: invoiceData.date
                });
                
                // If the price is different from the customer's current price, save it
                if (customPrice !== item.price) {
                  const { error: pricingError } = await supabase
                    .from('customer_pricing')
                    .upsert({
                      customer_id: invoiceData.customer_id,
                      product_id: item.product_id,
                      price: item.price,
                      effective_date: invoiceData.date,
                      is_active: true,
                      updated_by: (await supabase.auth.getUser()).data.user?.id,
                    });
                  
                  if (pricingError) {
                    console.warn('Failed to save customer pricing:', pricingError);
                  }
                }
              } catch (error) {
                console.warn('Failed to process custom pricing for product:', item.product_id, error);
              }
            })
          );
        } catch (error) {
          console.warn('Error processing customer pricing updates:', error);
          // Don't fail the entire operation for pricing issues
        }
      }

      // Update the invoice with validated data
      const updateData = {
        ...invoiceData,
        updated_at: new Date().toISOString()
      };
      
      console.log('Executing invoice update with data:', updateData);
      
      const { data: updatedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select()
        .single();
      
      if (invoiceError) {
        console.error('Invoice update error:', invoiceError);
        throw new Error(`Failed to update invoice: ${invoiceError.message}`);
      }

      console.log('Invoice updated successfully:', updatedInvoice);

      // Update invoice items if provided
      if (items && items.length > 0) {
        console.log('Updating invoice items...');
        
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoiceId);
        
        if (deleteError) {
          console.error('Error deleting existing items:', deleteError);
          throw new Error(`Failed to delete existing items: ${deleteError.message}`);
        }

        // Insert new items
        const itemsWithInvoiceId = items.map(item => ({
          ...item,
          invoice_id: invoiceId
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId);
        
        if (itemsError) {
          console.error('Error inserting updated items:', itemsError);
          throw new Error(`Failed to update invoice items: ${itemsError.message}`);
        }
        
        console.log('Invoice items updated successfully');
      }

      return updatedInvoice;
    },
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['customer-pricing'] });
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Update invoice mutation error:', error);
      toast({
        title: "Error", 
        description: error.message || "Failed to update invoice",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId);
      
      if (itemsError) throw itemsError;

      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);
      
      if (invoiceError) throw invoiceError;

      return invoiceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
      console.error('Delete invoice error:', error);
    },
  });
};
