
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
  tempId?: string; // Add temp ID for better tracking
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
            // Skip optimistic items during customer price updates
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
    
    const tempId = `temp-${Date.now()}`;
    const optimisticItem: Item = {
      product_id: product.id,
      quantity: 1,
      price: product.base_price,
      total: product.base_price,
      product_name: product.name,
      product_size: product.size,
      product_sku: product.sku,
      isOptimistic: true,
      tempId
    };
    
    // Add optimistic item
    setItems(prevItems => [...prevItems, optimisticItem]);
    
    try {
      let finalPrice = product.base_price;
      if (customerId) {
        const customerPrice = await getCustomerPrice(customerId, product.id);
        if (customerPrice !== null) {
          finalPrice = customerPrice;
        }
      }

      // Replace optimistic item with final item
      setItems(prevItems => 
        prevItems.map(item => 
          item.tempId === tempId
            ? {
                ...item,
                price: finalPrice,
                total: finalPrice,
                isOptimistic: false,
                tempId: undefined
              }
            : item
        )
      );
    } catch (error) {
      // Remove optimistic item on error
      setItems(prevItems => 
        prevItems.filter(item => item.tempId !== tempId)
      );
      console.error('Failed to add product:', error);
    } finally {
      setIsAddingItem(false);
    }
  }, [customerId, getCustomerPrice, isAddingItem]);

  const addItemFromModal = useCallback(async (product: Product) => {
    if (isAddingItem) return;
    
    setIsAddingItem(true);
    
    const tempId = `temp-${Date.now()}`;
    const optimisticItem: Item = {
      product_id: product.id,
      quantity: 1,
      price: product.base_price,
      total: product.base_price,
      product_name: product.name,
      product_size: product.size,
      product_sku: product.sku,
      isOptimistic: true,
      tempId
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

      setItems(prevItems => 
        prevItems.map(item => 
          item.tempId === tempId
            ? {
                ...item,
                price: finalPrice,
                total: finalPrice,
                isOptimistic: false,
                tempId: undefined
              }
            : item
        )
      );
    } catch (error) {
      setItems(prevItems => 
        prevItems.filter(item => item.tempId !== tempId)
      );
      console.error('Failed to add product:', error);
    } finally {
      setIsAddingItem(false);
    }
  }, [customerId, getCustomerPrice, isAddingItem]);

  const updateItemQuantity = useCallback((index: number, quantity: number) => {
    const validQuantity = Math.max(1, quantity);
    
    setItems(prevItems => {
      const newItems = [...prevItems];
      if (newItems[index] && !newItems[index].isOptimistic) {
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
      if (newItems[index] && !newItems[index].isOptimistic) {
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
    return items
      .filter(item => !item.isOptimistic) // Only count non-optimistic items
      .reduce((acc, item) => acc + item.total, 0);
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
