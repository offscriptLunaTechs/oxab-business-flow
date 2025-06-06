
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
      
      const itemsWithCustomPricing = await applyCustomerPricing(items, invoice.customer_id, invoice.date);
      
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
      toast({
        title: "Success",
        description: "Invoice created successfully with custom pricing applied",
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
      const { data: updatedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', invoiceId)
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;

      if (items) {
        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoiceId);
        
        if (deleteError) throw deleteError;

        const itemsWithInvoiceId = items.map(item => ({
          ...item,
          invoice_id: invoiceId
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId);
        
        if (itemsError) throw itemsError;
      }

      return updatedInvoice;
    },
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
      console.error('Update invoice error:', error);
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
