
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
  isOptimistic?: boolean; // Flag for optimistic updates
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
            const customerPrice = await getCustomerPrice(customerId, item.product_id);
            if (customerPrice !== null) {
              return {
                ...item,
                price: customerPrice,
                total: customerPrice * item.quantity,
                isOptimistic: false
              };
            }
            return { ...item, isOptimistic: false };
          })
        );
        setItems(updatedItems);
      };
      updateAllItemPrices();
    }
  }, [customerId, getCustomerPrice]);

  const addProductFromSearch = useCallback(async (product: Product) => {
    if (isAddingItem) return; // Prevent duplicate additions
    
    setIsAddingItem(true);
    
    // Optimistic update - add item immediately
    const optimisticItem: Item = {
      product_id: product.id,
      quantity: 1,
      price: product.base_price,
      total: product.base_price,
      product_name: product.name,
      product_size: product.size,
      product_sku: product.sku,
      isOptimistic: true
    };
    
    setItems(prevItems => [...prevItems, optimisticItem]);
    
    try {
      // Get actual customer price
      let finalPrice = product.base_price;
      if (customerId) {
        const customerPrice = await getCustomerPrice(customerId, product.id);
        if (customerPrice !== null) {
          finalPrice = customerPrice;
        }
      }

      // Update with final price
      const finalItem: Item = {
        ...optimisticItem,
        price: finalPrice,
        total: finalPrice,
        isOptimistic: false
      };
      
      setItems(prevItems => 
        prevItems.map(item => 
          item.product_id === product.id && item.isOptimistic 
            ? finalItem 
            : item
        )
      );
    } catch (error) {
      // Rollback on error
      setItems(prevItems => 
        prevItems.filter(item => 
          !(item.product_id === product.id && item.isOptimistic)
        )
      );
      console.error('Failed to add product:', error);
    } finally {
      setIsAddingItem(false);
    }
  }, [customerId, getCustomerPrice, isAddingItem]);

  const addItemFromModal = useCallback(async (product: Product) => {
    if (isAddingItem) return; // Prevent duplicate additions
    
    setIsAddingItem(true);
    
    // Optimistic update
    const optimisticItem: Item = {
      product_id: product.id,
      quantity: 1,
      price: product.base_price,
      total: product.base_price,
      product_name: product.name,
      product_size: product.size,
      product_sku: product.sku,
      isOptimistic: true
    };
    
    setItems(prevItems => [...prevItems, optimisticItem]);
    
    try {
      let finalPrice = product.base_price;
      if (customerId) {
        const customerPrice = await getCustomerPrice(customerId, product.id);
        if (customerPrice !== null) {
          finalPrice = customerPrice;
        }
      }

      const finalItem: Item = {
        ...optimisticItem,
        price: finalPrice,
        total: finalPrice,
        isOptimistic: false
      };
      
      setItems(prevItems => 
        prevItems.map(item => 
          item.product_id === product.id && item.isOptimistic 
            ? finalItem 
            : item
        )
      );
    } catch (error) {
      // Rollback on error
      setItems(prevItems => 
        prevItems.filter(item => 
          !(item.product_id === product.id && item.isOptimistic)
        )
      );
      console.error('Failed to add product:', error);
    } finally {
      setIsAddingItem(false);
    }
  }, [customerId, getCustomerPrice, isAddingItem]);

  const updateItemQuantity = useCallback((index: number, quantity: number) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index].quantity = Math.max(1, quantity);
      newItems[index].total = newItems[index].quantity * newItems[index].price;
      return newItems;
    });
  }, []);

  const updateItemPrice = useCallback((index: number, price: number) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index].price = Math.max(0, price);
      newItems[index].total = newItems[index].quantity * newItems[index].price;
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
