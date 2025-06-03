
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
  phone: string;
  email?: string;
  customer_type: 'wholesale' | 'retail';
  address?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  description?: string;
  category: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  status: 'draft' | 'pending' | 'paid' | 'cancelled';
  total: number;
  items: InvoiceItem[];
  created_at: string;
  due_date?: string;
}

export interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface DashboardStats {
  todayInvoices: number;
  pendingInvoices: number;
  lowStockItems: number;
  totalRevenue: number;
}
