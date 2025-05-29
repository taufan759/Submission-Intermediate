// Enhanced vite.config.js untuk PetaBicara
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true,
    host: true, // Allow external connections
    cors: true
  },
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  
  // Ensure static assets are served correctly
  publicDir: 'public',
  
  // CSS handling
  css: {
    devSourcemap: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    exclude: ['leaflet'] // Let Leaflet load from CDN
  },
  
  // Define global constants if needed
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production')
  }
});