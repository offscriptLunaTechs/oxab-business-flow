
import { lazy } from 'react';

// Lazy load major route components
export const LazyDashboardLayout = lazy(() => import('@/components/layout/DashboardLayout'));
export const LazyCustomersLayout = lazy(() => import('@/components/layout/CustomersLayout'));
export const LazyInvoicesLayout = lazy(() => import('@/components/layout/InvoicesLayout'));
export const LazyInventoryLayout = lazy(() => import('@/components/layout/InventoryLayout'));
export const LazyReportsLayout = lazy(() => import('@/components/layout/ReportsLayout'));
export const LazySettingsLayout = lazy(() => import('@/components/layout/SettingsLayout'));

// Lazy load page components
export const LazyDashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
export const LazyCustomers = lazy(() => import('@/pages/customers/Customers'));
export const LazyInventory = lazy(() => import('@/pages/inventory/Inventory'));
export const LazyOutstandingInvoicesReport = lazy(() => import('@/pages/reports/OutstandingInvoicesReport'));
