import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, loadEnv } from 'vite';

// Env frontend (VITE_*) ada di .env root (ADR D-001, D-003).
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, '..', 'VITE_');
  return {
    base: env.VITE_BASE || '/',
    envDir: '..',
    // Dev server selalu ditemani API (npm run dev); build/preview ikut .env (Pages = local).
    define: command === 'serve' ? { 'import.meta.env.VITE_API_MODE': '"api"' } : {},
    plugins: [svelte()],
    build: { manifest: true },
    server: { port: 5173, proxy: { '/api': 'http://localhost:8000' } },
  };
});
