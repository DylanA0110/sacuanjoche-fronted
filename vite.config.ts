import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react-map-gl', 'mapbox-gl'],
    exclude: [],
  },
  build: {
    // Optimizaciones de build
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'animation-vendor': ['framer-motion'],
          'ui-vendor': ['lucide-react'],
          // Mapbox es grande; mantenerlo aislado del chunk principal
          'mapbox-vendor': ['mapbox-gl', 'react-map-gl'],
        },
      },
    },
    // Chunk size warnings
    // Mapbox suele generar chunks > 1MB; subir el umbral para evitar warnings ruidosos.
    chunkSizeWarningLimit: 2000,
    // Minificación (esbuild es más rápido que terser)
    minify: 'esbuild',
  },
  // Optimización de assets
  assetsInclude: ['**/*.jpg', '**/*.png', '**/*.svg'],
});
