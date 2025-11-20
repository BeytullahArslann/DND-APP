import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoBase = process.env.GITHUB_REPOSITORY?.split('/')[1];
const defaultBase = repoBase ? `/${repoBase}/` : '/';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Prefer an explicit BASE_PATH when provided, fall back to the repository name on GitHub Pages builds.
  base: process.env.BASE_PATH || (command === 'build' ? defaultBase : '/'),
  server: {
    host: '0.0.0.0',
    port: 5173
  }
}));
