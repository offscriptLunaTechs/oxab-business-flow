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
  const [topSellingProducts, setTopSellingProducts] = useState<string[]>([]);

  const { data: allProducts = [] } = useProducts(searchTerm);
  const { data: customers = [] } = useCustomers();
  const createInvoice = useCreateInvoice();

  // Fetch top-selling products on component mount
  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('invoice_items')
          .select(`
            product_id,
            quantity,
            invoices!inner(date)
          `)
          .gte('invoices.date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 90 days
          .order('invoices.date', { ascending: false });

        if (error) {
          console.warn('Could not fetch top-selling products:', error);
          return;
        }

        // Group by product_id and sum quantities
        const productSales = new Map<string, number>();
        data?.forEach(item => {
          const current = productSales.get(item.product_id) || 0;
          productSales.set(item.product_id, current + item.quantity);
        });

        // Sort by quantity sold and get top 20
        const sortedProducts = Array.from(productSales.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([productId]) => productId);

        setTopSellingProducts(sortedProducts);
      } catch (error) {
        console.warn('Error fetching top-selling products:', error);
      }
    };

    fetchTopSellingProducts();
  }, []);

  // Sort products to prioritize top-selling items
  const displayProducts = searchTerm ? 
    allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : 
    allProducts
      .filter(product => product.status === 'active') // Only show active products
      .sort((a, b) => {
        // First, prioritize top-selling products
        const aIndex = topSellingProducts.indexOf(a.id);
        const bIndex = topSellingProducts.indexOf(b.id);
        
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex; // Both are top-selling, maintain their order
        }
        if (aIndex !== -1) return -1; // a is top-selling, b is not
        if (bIndex !== -1) return 1;  // b is top-selling, a is not
        
        // For non-top-selling products, prioritize by stock level and name
        if (a.stock_level !== b.stock_level) {
          return (b.stock_level || 0) - (a.stock_level || 0);
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, 8); // Show top 8 products when no search

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
