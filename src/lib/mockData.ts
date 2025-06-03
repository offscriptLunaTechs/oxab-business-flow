
import { Customer, Product, Invoice, User, DashboardStats } from "@/types";

export const mockUser: User = {
  id: "1",
  email: "admin@kecc.com",
  name: "Ahmed Al-Mansouri",
  role: "manager"
};

export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Al-Noor Supermarket",
    phone: "+965 2222 3333",
    email: "orders@alnoor.com",
    customer_type: "wholesale",
    address: "Salmiya, Block 2, Street 15",
    created_at: "2024-01-15"
  },
  {
    id: "2",
    name: "Fresh Market Co.",
    phone: "+965 9999 8888",
    email: "manager@freshmarket.kw",
    customer_type: "wholesale",
    address: "Hawalli, Al-Zahra District",
    created_at: "2024-02-10"
  },
  {
    id: "3",
    name: "City Center Retail",
    phone: "+965 5555 7777",
    customer_type: "retail",
    address: "Kuwait City, Commercial Area",
    created_at: "2024-03-05"
  },
  {
    id: "4",
    name: "Peninsula Trading",
    phone: "+965 1111 2222",
    email: "purchasing@peninsula.kw",
    customer_type: "wholesale",
    address: "Farwaniya, Industrial Area",
    created_at: "2024-02-28"
  }
];

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "OXAB Mineral Water 200ml",
    sku: "OXAB-200",
    price: 0.150,
    stock_quantity: 2400,
    description: "Premium mineral water in convenient 200ml bottles",
    category: "Mineral Water"
  },
  {
    id: "2",
    name: "OXAB Mineral Water 330ml",
    sku: "OXAB-330",
    price: 0.220,
    stock_quantity: 1800,
    description: "Premium mineral water in standard 330ml bottles",
    category: "Mineral Water"
  },
  {
    id: "3",
    name: "OXAB Mineral Water 500ml",
    sku: "OXAB-500",
    price: 0.300,
    stock_quantity: 1200,
    description: "Premium mineral water in 500ml bottles",
    category: "Mineral Water"
  },
  {
    id: "4",
    name: "OXAB Mineral Water 1L",
    sku: "OXAB-1000",
    price: 0.450,
    stock_quantity: 800,
    description: "Premium mineral water in large 1L bottles",
    category: "Mineral Water"
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoice_number: "INV-2024-001",
    customer_id: "1",
    customer_name: "Al-Noor Supermarket",
    status: "paid",
    total: 540.00,
    items: [
      {
        id: "1",
        product_id: "1",
        product_name: "OXAB Mineral Water 200ml",
        quantity: 1200,
        unit_price: 0.150,
        total: 180.00
      },
      {
        id: "2",
        product_id: "2",
        product_name: "OXAB Mineral Water 330ml",
        quantity: 800,
        unit_price: 0.220,
        total: 176.00
      },
      {
        id: "3",
        product_id: "3",
        product_name: "OXAB Mineral Water 500ml",
        quantity: 400,
        unit_price: 0.300,
        total: 120.00
      },
      {
        id: "4",
        product_id: "4",
        product_name: "OXAB Mineral Water 1L",
        quantity: 144,
        unit_price: 0.450,
        total: 64.80
      }
    ],
    created_at: "2024-06-01",
    due_date: "2024-06-15"
  },
  {
    id: "2",
    invoice_number: "INV-2024-002",
    customer_id: "2",
    customer_name: "Fresh Market Co.",
    status: "pending",
    total: 324.00,
    items: [
      {
        id: "5",
        product_id: "2",
        product_name: "OXAB Mineral Water 330ml",
        quantity: 600,
        unit_price: 0.220,
        total: 132.00
      },
      {
        id: "6",
        product_id: "3",
        product_name: "OXAB Mineral Water 500ml",
        quantity: 640,
        unit_price: 0.300,
        total: 192.00
      }
    ],
    created_at: "2024-06-02",
    due_date: "2024-06-16"
  }
];

export const mockStats: DashboardStats = {
  todayInvoices: 3,
  pendingInvoices: 5,
  lowStockItems: 2,
  totalRevenue: 12480.50
};
