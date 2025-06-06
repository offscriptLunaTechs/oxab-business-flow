
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import AuthCallback from "./pages/auth/AuthCallback";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";
import { OptimizedAuthProvider } from "./context/OptimizedAuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { LoadingSpinner } from "./components/ui/loading-spinner";

// Lazy load components for better performance
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const CreateInvoice = lazy(() => import("./pages/invoices/CreateInvoice"));
const InvoicesList = lazy(() => import("./pages/invoices/InvoicesList"));
const InvoiceDetail = lazy(() => import("./pages/invoices/InvoiceDetail"));
const EditInvoice = lazy(() => import("./pages/invoices/EditInvoice"));
const Customers = lazy(() => import("./pages/customers/Customers"));
const Profile = lazy(() => import("./pages/profile/Profile"));

// Admin components - separate chunk
const Settings = lazy(() => import("./pages/settings/Settings"));
const Users = lazy(() => import("./pages/settings/Users"));
const SecurityDashboard = lazy(() => import("./components/security/SecurityDashboard"));

// Configure React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <OptimizedAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={
                <Suspense fallback={<LoadingSpinner size="lg" />}>
                  <Dashboard />
                </Suspense>
              } />
              <Route path="invoices" element={
                <Suspense fallback={<LoadingSpinner size="lg" />}>
                  <InvoicesList />
                </Suspense>
              } />
              <Route path="invoices/new" element={
                <Suspense fallback={<LoadingSpinner size="lg" />}>
                  <CreateInvoice />
                </Suspense>
              } />
              <Route path="invoices/:id" element={
                <Suspense fallback={<LoadingSpinner size="lg" />}>
                  <InvoiceDetail />
                </Suspense>
              } />
              <Route path="invoices/:id/edit" element={
                <Suspense fallback={<LoadingSpinner size="lg" />}>
                  <EditInvoice />
                </Suspense>
              } />
              <Route path="inventory" element={<div className="p-8 text-center">Inventory page coming soon...</div>} />
              <Route path="customers" element={
                <Suspense fallback={<LoadingSpinner size="lg" />}>
                  <Customers />
                </Suspense>
              } />
              <Route path="profile" element={
                <Suspense fallback={<LoadingSpinner size="lg" />}>
                  <Profile />
                </Suspense>
              } />
              
              {/* Settings Routes - Admin Only - Separate chunk */}
              <Route path="settings" element={
                <ProtectedRoute requiredRole="admin">
                  <Suspense fallback={<LoadingSpinner size="lg" />}>
                    <Settings />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="settings/users" element={
                <ProtectedRoute requiredRole="admin">
                  <Suspense fallback={<LoadingSpinner size="lg" />}>
                    <Users />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="settings/security" element={
                <ProtectedRoute requiredRole="admin">
                  <Suspense fallback={<LoadingSpinner size="lg" />}>
                    <SecurityDashboard />
                  </Suspense>
                </ProtectedRoute>
              } />
              
              <Route path="reports" element={<div className="p-8 text-center">Reports page coming soon...</div>} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </OptimizedAuthProvider>
  </QueryClientProvider>
);

export default App;
