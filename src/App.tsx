
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import CreateInvoice from "./pages/invoices/CreateInvoice";
import InvoicesList from "./pages/invoices/InvoicesList";
import InvoiceDetail from "./pages/invoices/InvoiceDetail";
import EditInvoice from "./pages/invoices/EditInvoice";
import Customers from "./pages/customers/Customers";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/login" element={<Login />} />
          
          {/* Protected Routes with Layout */}
          <Route path="/" element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="invoices" element={<InvoicesList />} />
            <Route path="invoices/new" element={<CreateInvoice />} />
            <Route path="invoices/:id" element={<InvoiceDetail />} />
            <Route path="invoices/:id/edit" element={<EditInvoice />} />
            <Route path="inventory" element={<div className="p-8 text-center">Inventory page coming soon...</div>} />
            <Route path="customers" element={<Customers />} />
            <Route path="settings" element={<div className="p-8 text-center">Settings page coming soon...</div>} />
            <Route path="reports" element={<div className="p-8 text-center">Reports page coming soon...</div>} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
