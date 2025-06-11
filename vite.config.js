import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Submission-Intermediate/',
  
  server: {
    port: 5173,
    open: true,
    host: true,
    cors: true
  },
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  
  publicDir: 'public'
});