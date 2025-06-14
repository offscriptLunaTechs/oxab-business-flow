import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CustomersLayout from "@/components/layout/CustomersLayout";
import InvoicesLayout from "@/components/layout/InvoicesLayout";
import InventoryLayout from "@/components/layout/InventoryLayout";
import ReportsLayout from "@/components/layout/ReportsLayout";
import SettingsLayout from "@/components/layout/SettingsLayout";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import AuthCallback from "./pages/auth/AuthCallback";
import NotFound from "./pages/NotFound";
import InvitationSignup from "./pages/auth/InvitationSignup";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/invitation" element={<InvitationSignup />} />
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers/*"
                element={
                  <ProtectedRoute>
                    <CustomersLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory/*"
                element={
                  <ProtectedRoute>
                    <InventoryLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoices/*"
                element={
                  <ProtectedRoute>
                    <InvoicesLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/*"
                element={
                  <ProtectedRoute>
                    <ReportsLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <SettingsLayout />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
