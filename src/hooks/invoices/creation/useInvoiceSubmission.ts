
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCreateInvoice } from '@/hooks/useInvoices';

interface InvoiceSubmissionData {
  customerId: string;
  date: Date;
  dueDate: Date;
  itemsArray: Array<{
    product_id: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  notes: string;
  discount: number;
  isFreeOfCharge: boolean;
  subtotal: number;
  total: number;
}

export const useInvoiceSubmission = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createInvoice = useCreateInvoice();

  const submitInvoice = useCallback(async (data: InvoiceSubmissionData) => {
    if (!data.customerId || data.itemsArray.length === 0) {
      toast({
        title: "Error",
        description: "Customer and items are required",
        variant: "destructive",
      });
      return;
    }

    const invoiceData = {
      customer_id: data.customerId,
      date: data.date.toISOString().split('T')[0],
      due_date: data.dueDate.toISOString().split('T')[0],
      subtotal: data.subtotal,
      tax: 0,
      discount: data.discount,
      total: data.total,
      status: 'pending',
      notes: data.isFreeOfCharge ? `${data.notes}\n[FREE OF CHARGE]`.trim() : data.notes,
      items: data.itemsArray.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: data.isFreeOfCharge ? 0 : item.price,
        total: data.isFreeOfCharge ? 0 : item.total
      }))
    };

    try {
      const result = await createInvoice.mutateAsync(invoiceData);
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      navigate(`/invoices/${result.id}`);
    } catch (error) {
      console.error('Failed to create invoice', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    }
  }, [createInvoice, navigate, toast]);

  return {
    submitInvoice,
    isSubmitting: createInvoice.isPending,
  };
};
