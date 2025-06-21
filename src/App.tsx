
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { LazyRoute } from "@/components/common/LazyRoute";
import { 
  LazyDashboardLayout,
  LazyCustomersLayout,
  LazyInvoicesLayout,
  LazyInventoryLayout,
  LazyReportsLayout,
  LazySettingsLayout
} from "@/components/lazy/LazyComponents";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import AuthCallback from "./pages/auth/AuthCallback";
import NotFound from "./pages/NotFound";
import InvitationSignup from "./pages/auth/InvitationSignup";
import { logger } from "@/utils/logger";

// Configure React Query with production-ready settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        logger.error('Mutation error', error);
      },
    },
  },
});

// Add global error handling
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', event.reason);
});

window.addEventListener('error', (event) => {
  logger.error('Global error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

function App() {
  logger.info('App initialized');

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
                    <LazyRoute>
                      <LazyDashboardLayout />
                    </LazyRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers/*"
                element={
                  <ProtectedRoute>
                    <LazyRoute>
                      <LazyCustomersLayout />
                    </LazyRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory/*"
                element={
                  <ProtectedRoute>
                    <LazyRoute>
                      <LazyInventoryLayout />
                    </LazyRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoices/*"
                element={
                  <ProtectedRoute>
                    <LazyRoute>
                      <LazyInvoicesLayout />
                    </LazyRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/*"
                element={
                  <ProtectedRoute>
                    <LazyRoute>
                      <LazyReportsLayout />
                    </LazyRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <LazyRoute>
                      <LazySettingsLayout />
                    </LazyRoute>
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
