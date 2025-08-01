import { defineConfig } from 'vite';

export default defineConfig({
  base: '/image-converter/', // Necesario para despliegue en GitHub Pages
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['browser-image-compression'],
          utils: ['jszip'],
        },
        // Optimizaciones de seguridad y cache busting
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Optimizaciones de rendimiento
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    // Generar source maps solo en desarrollo
    sourcemap: false,
    // Límite de advertencias de tamaño
    chunkSizeWarningLimit: 1000,
    // Optimizaciones de CSS
    cssCodeSplit: true,
    // Optimizaciones de assets
    assetsInlineLimit: 4096,
  },
  // Optimizaciones de desarrollo
  server: {
    hmr: true,
    // Headers de seguridad para desarrollo
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
  // Optimizaciones de plugins
  plugins: [],
  // Configuración de optimización
  optimizeDeps: {
    include: ['browser-image-compression', 'jszip'],
    exclude: ['canvas'], // Excluir dependencias innecesarias
  },
  // Configuración de assets
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.ico'],
  
  // Configuración específica para favicon
  publicDir: 'public',
});