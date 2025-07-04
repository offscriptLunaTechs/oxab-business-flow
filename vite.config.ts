import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
// import { cloudflare } from "@cloudflare/vite-plugin";
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
    // cloudflare(), // Disabled for compatibility
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
          
          // Feature chunks - using actual existing files
          'dashboard-feature': [
            './src/pages/dashboard/Dashboard'
          ],
          'customer-feature': [
            './src/pages/customers/Customers'
          ],
          'inventory-feature': [
            './src/pages/inventory/Inventory'
          ],
          'settings-feature': [
            './src/pages/settings/Settings',
            './src/pages/settings/Users'
          ],
          'reports-feature': [
            './src/pages/reports/OutstandingInvoicesReport'
          ],
          // PDF chunks - separate heavy PDF dependencies
          'pdf-vendor': [
            '@react-pdf/renderer'
          ]
        },
        entryFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId) {
            const fileName = facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') || 'main';
            return `assets/${fileName}-[hash].js`;
          }
          return `assets/main-[hash].js`;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'react-router-dom',
      '@supabase/supabase-js'
    ]
  },
  define: {
    ...(mode === 'production' && {
      'console.log': '() => {}',
      'console.debug': '() => {}',
    }),
  }
}));
