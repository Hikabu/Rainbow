import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import svgLoader from 'vite-svg-loader';

export default defineConfig({
  plugins: [vue(), svgLoader()],
  server: {
    proxy: {
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
      pages: '/src/pages',
      features: '/src/features',
      entities: '/src/entities',
      components: '/src/components',
      shared: '/src/shared',
      assets: '/src/assets',
      config: '/src/config',
    },
  },
});
