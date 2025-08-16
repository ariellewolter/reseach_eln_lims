import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src',
  server: {
    port: 5174,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@research/types': path.resolve(__dirname, '../../packages/types/src'),
      '@research/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@research/theme': path.resolve(__dirname, '../../packages/theme/src'),
      '@research/utils': path.resolve(__dirname, '../../packages/utils/src'),
    }
  }
});
