import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Allow overriding the base path for GitHub Pages deployments.
  base: process.env.BASE_PATH || '/',
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
