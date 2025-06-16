
import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/invoice';
import { useCustomerPricing } from './useCustomerPricing';

export interface Item {
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  product_name?: string;
  product_size?: string;
  product_sku?: string;
  isOptimistic?: boolean;
  tempId?: string;
}

export const useInvoiceItems = (customerId: string) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const { getCustomerPrice } = useCustomerPricing();

  // Update all item prices when customer changes
  useEffect(() => {
    if (customerId && items.length > 0) {
      const updateAllItemPrices = async () => {
        const updatedItems = await Promise.all(
          items.map(async (item) => {
            if (item.isOptimistic) return item;
            
            const customerPrice = await getCustomerPrice(customerId, item.product_id);
            if (customerPrice !== null) {
              return {
                ...item,
                price: customerPrice,
                total: customerPrice * item.quantity,
              };
            }
            return item;
          })
        );
        setItems(updatedItems);
      };
      updateAllItemPrices();
    }
  }, [customerId, getCustomerPrice]);

  const addProductFromSearch = useCallback(async (product: Product) => {
    if (isAddingItem) return;
    
    setIsAddingItem(true);
    
    try {
      let finalPrice = product.base_price;
      if (customerId) {
        const customerPrice = await getCustomerPrice(customerId, product.id);
        if (customerPrice !== null) {
          finalPrice = customerPrice;
        }
      }

      const newItem: Item = {
        product_id: product.id,
        quantity: 1,
        price: finalPrice,
        total: finalPrice,
        product_name: product.name,
        product_size: product.size,
        product_sku: product.sku,
      };
      
      setItems(prevItems => [...prevItems, newItem]);
    } catch (error) {
      console.error('Failed to add product:', error);
    } finally {
      setIsAddingItem(false);
    }
  }, [customerId, getCustomerPrice, isAddingItem]);

  const addItemFromModal = useCallback(async (product: Product) => {
    if (isAddingItem) return;
    
    setIsAddingItem(true);
    
    try {
      let finalPrice = product.base_price;
      if (customerId) {
        const customerPrice = await getCustomerPrice(customerId, product.id);
        if (customerPrice !== null) {
          finalPrice = customerPrice;
        }
      }

      const newItem: Item = {
        product_id: product.id,
        quantity: 1,
        price: finalPrice,
        total: finalPrice,
        product_name: product.name,
        product_size: product.size,
        product_sku: product.sku,
      };
      
      setItems(prevItems => [...prevItems, newItem]);
    } catch (error) {
      console.error('Failed to add product:', error);
    } finally {
      setIsAddingItem(false);
    }
  }, [customerId, getCustomerPrice, isAddingItem]);

  const updateItemQuantity = useCallback((index: number, quantity: number) => {
    const validQuantity = Math.max(1, quantity);
    
    setItems(prevItems => {
      const newItems = [...prevItems];
      if (newItems[index]) {
        newItems[index] = {
          ...newItems[index],
          quantity: validQuantity,
          total: validQuantity * newItems[index].price
        };
      }
      return newItems;
    });
  }, []);

  const updateItemPrice = useCallback((index: number, price: number) => {
    const validPrice = Math.max(0, price);
    
    setItems(prevItems => {
      const newItems = [...prevItems];
      if (newItems[index]) {
        newItems[index] = {
          ...newItems[index],
          price: validPrice,
          total: newItems[index].quantity * validPrice
        };
      }
      return newItems;
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  }, []);

  const calculateSubtotal = useCallback(() => {
    return items.reduce((acc, item) => acc + item.total, 0);
  }, [items]);

  return {
    items,
    isAddingItem,
    addProductFromSearch,
    addItemFromModal,
    updateItemQuantity,
    updateItemPrice,
    removeItem,
    calculateSubtotal,
  };
};
