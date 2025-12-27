import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separate vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            return 'vendor';
          }
          
          // Separate feature chunks
          if (id.includes('/features/pos')) {
            return 'pos-features';
          }
          if (id.includes('/features/products')) {
            return 'product-features';
          }
          if (id.includes('/features/auth')) {
            return 'auth-features';
          }
          if (id.includes('/features/sales')) {
            return 'sales-features';
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
