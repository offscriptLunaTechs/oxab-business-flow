
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging, remove in production
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tooltip'
          ],
          'routing-vendor': ['react-router-dom'],
          
          // Feature chunks
          'invoice-feature': [
            './src/pages/invoices/CreateInvoice',
            './src/pages/invoices/InvoicesList',
            './src/pages/invoices/InvoiceDetail',
            './src/pages/invoices/EditInvoice'
          ],
          'customer-feature': [
            './src/pages/customers/Customers'
          ],
          'admin-feature': [
            './src/pages/settings/Settings',
            './src/pages/settings/Users',
            './src/components/security/SecurityDashboard'
          ]
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'react-router-dom',
      '@supabase/supabase-js'
    ]
  }
});
