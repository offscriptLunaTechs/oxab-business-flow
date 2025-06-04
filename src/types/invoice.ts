

export interface Invoice {
  id: string;
  customer_id: string;
  date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string; // Changed from union type to string to match database
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  customer_type: string; // Changed from union type to string to match database
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  base_price: number;
  size: string;
  pack_size?: number;
  trademark?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
  reorder_level: number;
  last_updated: string;
  last_restock_date?: string;
  notes?: string;
}

export interface InvoiceWithDetails extends Invoice {
  customer: Customer;
  items: (InvoiceItem & { product: Product })[];
}
