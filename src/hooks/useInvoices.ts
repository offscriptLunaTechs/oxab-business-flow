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

const generateNextInvoiceId = async (): Promise<string> => {
  console.log('Generating next invoice ID...');
  
  // Get the latest invoice to determine the next number
  const { data: latestInvoices, error } = await supabase
    .from('invoices')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error fetching latest invoices:', error);
    throw error;
  }
  
  console.log('Latest invoices:', latestInvoices);
  
  let maxNumber = 1690; // Start from a base number
  
  if (latestInvoices && latestInvoices.length > 0) {
    // Extract numbers from existing invoice IDs
    const numbers = latestInvoices
      .map(invoice => {
        // Extract number from invoice ID (assuming format like "1691", "INV-1692", etc.)
        const match = invoice.id.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0);
    
    if (numbers.length > 0) {
      maxNumber = Math.max(...numbers);
    }
  }
  
  const nextNumber = maxNumber + 1;
  console.log('Next invoice number:', nextNumber);
  
  return nextNumber.toString();
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
      
      // Generate sequential invoice ID
      const invoiceId = await generateNextInvoiceId();
      
      console.log('Creating invoice with ID:', invoiceId);
      
      // Create invoice
      const { data: createdInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          ...invoice,
          id: invoiceId
        })
        .select()
        .single();
      
      if (invoiceError) {
        console.error('Invoice creation error:', invoiceError);
        throw invoiceError;
      }

      // Create invoice items
      const itemsWithInvoiceId = items.map(item => ({
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
        description: "Invoice created successfully",
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
