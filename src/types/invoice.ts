
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  phone: string;
  email?: string;
  customer_type: 'wholesale' | 'retail';
  address?: string;
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  size: string;
  base_price: number;
  pack_size?: number;
  trademark?: string;
  description?: string;
  status: 'active' | 'discontinued' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
  reorder_level: number;
  last_updated: string;
  created_at: string;
  notes?: string;
  last_restock_date?: string;
}

export interface Invoice {
  id: string;
  customer_id: string;
  date: string;
  due_date: string;
  status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'overdue';
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
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
  product?: Product;
}

export interface InvoiceWithDetails extends Invoice {
  customer: Customer;
  items: InvoiceItem[];
}

export interface DashboardStats {
  todayInvoices: number;
  pendingInvoices: number;
  lowStockItems: number;
  totalRevenue: number;
}
