
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import AuthCallback from "./pages/auth/AuthCallback";
import Dashboard from "./pages/dashboard/Dashboard";
import CreateInvoice from "./pages/invoices/CreateInvoice";
import InvoicesList from "./pages/invoices/InvoicesList";
import InvoiceDetail from "./pages/invoices/InvoiceDetail";
import EditInvoice from "./pages/invoices/EditInvoice";
import Customers from "./pages/customers/Customers";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/settings/Settings";
import Users from "./pages/settings/Users";
import SecurityDashboard from "./components/security/SecurityDashboard";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="invoices" element={<InvoicesList />} />
              <Route path="invoices/new" element={<CreateInvoice />} />
              <Route path="invoices/:id" element={<InvoiceDetail />} />
              <Route path="invoices/:id/edit" element={<EditInvoice />} />
              <Route path="inventory" element={<div className="p-8 text-center">Inventory page coming soon...</div>} />
              <Route path="customers" element={<Customers />} />
              <Route path="profile" element={<Profile />} />
              
              {/* Settings Routes - Admin Only */}
              <Route path="settings" element={
                <ProtectedRoute requiredRole="admin">
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="settings/users" element={
                <ProtectedRoute requiredRole="admin">
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="settings/security" element={
                <ProtectedRoute requiredRole="admin">
                  <SecurityDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="reports" element={<div className="p-8 text-center">Reports page coming soon...</div>} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
