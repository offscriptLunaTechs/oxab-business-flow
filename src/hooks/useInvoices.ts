
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceWithDetails, InvoiceItem } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!invoices_customer_id_fkey(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async (): Promise<InvoiceWithDetails> => {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!invoices_customer_id_fkey(*)
        `)
        .eq('id', invoiceId)
        .single();
      
      if (invoiceError) throw invoiceError;

      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select(`
          *,
          products!invoice_items_product_id_fkey(*)
        `)
        .eq('invoice_id', invoiceId);
      
      if (itemsError) throw itemsError;

      return {
        ...invoice,
        customer: invoice.customers,
        items: items.map(item => ({
          ...item,
          product: item.products
        }))
      };
    },
    enabled: !!invoiceId,
  });
};

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
      
      // Create invoice
      const { data: createdInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;

      // Create invoice items
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: createdInvoice.id
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId);
      
      if (itemsError) throw itemsError;

      return createdInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
      console.error('Create invoice error:', error);
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
      // Update invoice
      const { data: updatedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', invoiceId)
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;

      // Update items if provided
      if (items) {
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoiceId);
        
        if (deleteError) throw deleteError;

        // Insert new items
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
