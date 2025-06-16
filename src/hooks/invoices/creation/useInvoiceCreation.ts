
import { useReducer, useCallback } from 'react';
import { addDays } from 'date-fns';
import { Product } from '@/types/invoice';

interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  product_size: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceState {
  customerId: string;
  date: Date;
  dueDate: Date;
  items: Map<string, InvoiceItem>;
  notes: string;
  discount: number;
  isFreeOfCharge: boolean;
  searchTerm: string;
  isProductModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

type InvoiceAction =
  | { type: 'SET_CUSTOMER'; payload: string }
  | { type: 'SET_DATE'; payload: Date }
  | { type: 'SET_DUE_DATE'; payload: Date }
  | { type: 'ADD_ITEM'; payload: InvoiceItem }
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_ITEM_PRICE'; payload: { id: string; price: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'SET_DISCOUNT'; payload: number }
  | { type: 'SET_FREE_OF_CHARGE'; payload: boolean }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_PRODUCT_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_FORM' };

const initialState: InvoiceState = {
  customerId: '',
  date: new Date(),
  dueDate: addDays(new Date(), 30),
  items: new Map(),
  notes: '',
  discount: 0,
  isFreeOfCharge: false,
  searchTerm: '',
  isProductModalOpen: false,
  isLoading: false,
  error: null,
};

function invoiceReducer(state: InvoiceState, action: InvoiceAction): InvoiceState {
  switch (action.type) {
    case 'SET_CUSTOMER':
      return { ...state, customerId: action.payload };
    case 'SET_DATE':
      return { ...state, date: action.payload };
    case 'SET_DUE_DATE':
      return { ...state, dueDate: action.payload };
    case 'ADD_ITEM': {
      const newItems = new Map(state.items);
      newItems.set(action.payload.id, action.payload);
      return { ...state, items: newItems };
    }
    case 'UPDATE_ITEM_QUANTITY': {
      const newItems = new Map(state.items);
      const item = newItems.get(action.payload.id);
      if (item) {
        const updatedItem = {
          ...item,
          quantity: Math.max(1, action.payload.quantity),
          total: Math.max(1, action.payload.quantity) * item.price,
        };
        newItems.set(action.payload.id, updatedItem);
      }
      return { ...state, items: newItems };
    }
    case 'UPDATE_ITEM_PRICE': {
      const newItems = new Map(state.items);
      const item = newItems.get(action.payload.id);
      if (item) {
        const updatedItem = {
          ...item,
          price: Math.max(0, action.payload.price),
          total: item.quantity * Math.max(0, action.payload.price),
        };
        newItems.set(action.payload.id, updatedItem);
      }
      return { ...state, items: newItems };
    }
    case 'REMOVE_ITEM': {
      const newItems = new Map(state.items);
      newItems.delete(action.payload);
      return { ...state, items: newItems };
    }
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'SET_DISCOUNT':
      return { ...state, discount: Math.max(0, action.payload) };
    case 'SET_FREE_OF_CHARGE':
      return { ...state, isFreeOfCharge: action.payload, discount: action.payload ? 0 : state.discount };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_PRODUCT_MODAL_OPEN':
      return { ...state, isProductModalOpen: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_FORM':
      return initialState;
    default:
      return state;
  }
}

export const useInvoiceCreation = () => {
  const [state, dispatch] = useReducer(invoiceReducer, initialState);

  const setCustomerId = useCallback((customerId: string) => {
    dispatch({ type: 'SET_CUSTOMER', payload: customerId });
  }, []);

  const setDate = useCallback((date: Date) => {
    dispatch({ type: 'SET_DATE', payload: date });
  }, []);

  const setDueDate = useCallback((dueDate: Date) => {
    dispatch({ type: 'SET_DUE_DATE', payload: dueDate });
  }, []);

  const addProduct = useCallback((product: Product, price?: number) => {
    const finalPrice = price || product.base_price;
    const itemId = `${product.id}-${Date.now()}`;
    const item: InvoiceItem = {
      id: itemId,
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      product_size: product.size,
      quantity: 1,
      price: finalPrice,
      total: finalPrice,
    };
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { id: itemId, quantity } });
  }, []);

  const updateItemPrice = useCallback((itemId: string, price: number) => {
    dispatch({ type: 'UPDATE_ITEM_PRICE', payload: { id: itemId, price } });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  }, []);

  const setNotes = useCallback((notes: string) => {
    dispatch({ type: 'SET_NOTES', payload: notes });
  }, []);

  const setDiscount = useCallback((discount: number) => {
    dispatch({ type: 'SET_DISCOUNT', payload: discount });
  }, []);

  const setIsFreeOfCharge = useCallback((isFreeOfCharge: boolean) => {
    dispatch({ type: 'SET_FREE_OF_CHARGE', payload: isFreeOfCharge });
  }, []);

  const setSearchTerm = useCallback((searchTerm: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: searchTerm });
  }, []);

  const setIsProductModalOpen = useCallback((isOpen: boolean) => {
    dispatch({ type: 'SET_PRODUCT_MODAL_OPEN', payload: isOpen });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  // Computed values
  const itemsArray = Array.from(state.items.values());
  const subtotal = itemsArray.reduce((sum, item) => sum + item.total, 0);
  const total = state.isFreeOfCharge ? 0 : subtotal - state.discount;

  return {
    // State
    ...state,
    itemsArray,
    subtotal,
    total,
    
    // Actions
    setCustomerId,
    setDate,
    setDueDate,
    addProduct,
    updateItemQuantity,
    updateItemPrice,
    removeItem,
    setNotes,
    setDiscount,
    setIsFreeOfCharge,
    setSearchTerm,
    setIsProductModalOpen,
    setLoading,
    setError,
    resetForm,
  };
};
