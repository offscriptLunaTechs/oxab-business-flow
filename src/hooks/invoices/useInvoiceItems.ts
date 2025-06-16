
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
}

export const useInvoiceItems = (customerId: string) => {
  const [items, setItems] = useState<Item[]>([]);
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
  }, [customerId, getCustomerPrice]);

  const addProductFromSearch = useCallback(async (product: Product) => {
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
    
    // Use functional update to prevent race conditions
    setItems(prevItems => [...prevItems, newItem]);
  }, [customerId, getCustomerPrice]);

  const addItemFromModal = useCallback(async (product: Product) => {
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
    
    // Use functional update to prevent race conditions
    setItems(prevItems => [...prevItems, newItem]);
  }, [customerId, getCustomerPrice]);

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
    addProductFromSearch,
    addItemFromModal,
    updateItemQuantity,
    updateItemPrice,
    removeItem,
    calculateSubtotal,
  };
};
