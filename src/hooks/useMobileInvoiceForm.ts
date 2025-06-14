
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { useInvoiceFormState } from './invoices/useInvoiceFormState';
import { useInvoiceItems } from './invoices/useInvoiceItems';
import { useProductDisplay } from './invoices/useProductDisplay';

export const useMobileInvoiceForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: customers = [] } = useCustomers();
  const createInvoice = useCreateInvoice();

  const formState = useInvoiceFormState();
  const invoiceItems = useInvoiceItems(formState.customerId);
  const { displayProducts } = useProductDisplay(formState.searchTerm);

  const subtotal = invoiceItems.calculateSubtotal();
  const total = formState.isFreeOfCharge ? 0 : subtotal - formState.discount;

  const handleSubmit = async () => {
    if (!formState.customerId || invoiceItems.items.length === 0) {
      toast({
        title: "Error",
        description: "Customer and items are required",
        variant: "destructive",
      });
      return;
    }

    const invoiceData = {
      customer_id: formState.customerId,
      date: formState.date ? formState.date.toISOString().split('T')[0] : '',
      due_date: formState.dueDate ? formState.dueDate.toISOString().split('T')[0] : '',
      subtotal: subtotal,
      tax: 0,
      discount: formState.discount,
      total: total,
      status: 'pending',
      notes: formState.isFreeOfCharge ? `${formState.notes}\n[FREE OF CHARGE]`.trim() : formState.notes,
      items: invoiceItems.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: formState.isFreeOfCharge ? 0 : item.price,
        total: formState.isFreeOfCharge ? 0 : item.total
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
  };

  return {
    // State from formState
    ...formState,
    
    // Items management
    items: invoiceItems.items,
    
    // Computed values
    subtotal,
    total,
    displayProducts,
    
    // Data
    customers,
    createInvoice,
    
    // Actions
    addProductFromSearch: invoiceItems.addProductFromSearch,
    addItemFromModal: invoiceItems.addItemFromModal,
    updateItemQuantity: invoiceItems.updateItemQuantity,
    updateItemPrice: invoiceItems.updateItemPrice,
    removeItem: invoiceItems.removeItem,
    handleSubmit,
    
    // Navigation
    navigate
  };
};
