
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays } from 'date-fns';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/invoice';

export interface Item {
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  product_name?: string;
  product_size?: string;
  product_sku?: string;
}

export const useMobileInvoiceForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(addDays(new Date(), 30));
  const [items, setItems] = useState<Item[]>([]);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isFreeOfCharge, setIsFreeOfCharge] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const { data: products = [] } = useProducts(searchTerm);
  const { data: customers = [] } = useCustomers();
  const createInvoice = useCreateInvoice();

  const displayProducts = searchTerm ? 
    products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : 
    products.slice(0, 6);

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

  useEffect(() => {
    if (customerId && items.length > 0) {
      const updateAllItemPrices = async () => {
        const updatedItems = await Promise.all(
          items.map(async (item) => {
            const customerPrice = await getCustomerPrice(customerId, item.product_id);
            if (customerPrice !== null) {
              return {
                ...item,
                price: customerPrice,
                total: customerPrice * item.quantity
              };
            }
            return item;
          })
        );
        setItems(updatedItems);
      };
      updateAllItemPrices();
    }
  }, [customerId]);

  const addProductFromSearch = async (product: Product) => {
    let price = product.base_price;
    
    if (customerId) {
      const customerPrice = await getCustomerPrice(customerId, product.id);
      if (customerPrice !== null) {
        price = customerPrice;
      }
    }

    const newItem: Item = {
      product_id: product.id,
      quantity: 1,
      price: price,
      total: price,
      product_name: product.name,
      product_size: product.size,
      product_sku: product.sku,
    };
    setItems([...items, newItem]);
    setSearchTerm('');
  };

  const addItemFromModal = async (product: Product) => {
    let price = product.base_price;
    if (customerId) {
      const customerPrice = await getCustomerPrice(customerId, product.id);
      if (customerPrice !== null) {
        price = customerPrice;
      }
    }
    const newItem: Item = {
      product_id: product.id,
      quantity: 1,
      price: price,
      total: price,
      product_name: product.name,
      product_size: product.size,
      product_sku: product.sku,
    };
    setItems(prevItems => [...prevItems, newItem]);
    setSearchTerm(''); 
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, quantity);
    newItems[index].total = newItems[index].quantity * newItems[index].price;
    setItems(newItems);
  };

  const updateItemPrice = (index: number, price: number) => {
    const newItems = [...items];
    newItems[index].price = Math.max(0, price);
    newItems[index].total = newItems[index].quantity * newItems[index].price;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + item.total, 0);
  };

  const subtotal = calculateSubtotal();
  const total = isFreeOfCharge ? 0 : subtotal - discount;

  const handleSubmit = async () => {
    if (!customerId || items.length === 0) {
      toast({
        title: "Error",
        description: "Customer and items are required",
        variant: "destructive",
      });
      return;
    }

    const invoiceData = {
      customer_id: customerId,
      date: date ? date.toISOString().split('T')[0] : '',
      due_date: dueDate ? dueDate.toISOString().split('T')[0] : '',
      subtotal: subtotal,
      tax: 0,
      discount: discount,
      total: total,
      status: 'pending',
      notes: isFreeOfCharge ? `${notes}\n[FREE OF CHARGE]`.trim() : notes,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: isFreeOfCharge ? 0 : item.price,
        total: isFreeOfCharge ? 0 : item.total
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
    // State
    customerId,
    setCustomerId,
    date,
    setDate,
    dueDate,
    setDueDate,
    items,
    notes,
    setNotes,
    discount,
    setDiscount,
    isFreeOfCharge,
    setIsFreeOfCharge,
    searchTerm,
    setSearchTerm,
    isProductModalOpen,
    setIsProductModalOpen,
    
    // Computed values
    subtotal,
    total,
    displayProducts,
    
    // Data
    customers,
    createInvoice,
    
    // Actions
    addProductFromSearch,
    addItemFromModal,
    updateItemQuantity,
    updateItemPrice,
    removeItem,
    handleSubmit,
    
    // Navigation
    navigate
  };
};
