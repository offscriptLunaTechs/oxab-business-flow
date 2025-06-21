
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: mode === 'development',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.debug'] : [],
      },
      mangle: {
        safari10: true,
      },
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
          'pdf-vendor': ['@react-pdf/renderer', 'file-saver'],
          
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
        },
        // Better file naming for caching
        entryFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.tsx', '').replace('.ts', '') : 'main';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 800,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'react-router-dom',
      '@supabase/supabase-js'
    ],
    exclude: ['@react-pdf/renderer']
  },
  define: {
    // Remove console logs in production
    ...(mode === 'production' && {
      'console.log': '() => {}',
      'console.debug': '() => {}',
    }),
  },
}));
