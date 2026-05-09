import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    extensions: ['.ts', '.js', '.jsx', '.tsx'],
    alias: {
      // Points to the Cubism Framework TypeScript source bundled in the project.
      // This mirrors the alias in the official Cubism SDK sample vite.config.mts.
      '@framework': path.resolve(__dirname, 'src/live2d/framework'),
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
