import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const normalizeBase = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
};

const repoBase = process.env.GITHUB_REPOSITORY?.split('/')[1];
const envBase = normalizeBase(process.env.BASE_PATH);
const defaultBase = normalizeBase(repoBase) ?? '/';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Prefer an explicit BASE_PATH when provided, fall back to the repository name on GitHub Pages builds.
  base: envBase ?? (command === 'build' ? defaultBase : '/'),
  server: {
    host: '0.0.0.0',
    port: 5173
  }
}));
