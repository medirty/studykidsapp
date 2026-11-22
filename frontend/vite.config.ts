import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, loadEnv } from 'vite';

// Env frontend (VITE_*) ada di .env root (ADR D-001, D-003).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', 'VITE_');
  return {
    base: env.VITE_BASE || '/',
    envDir: '..',
    plugins: [svelte()],
    build: { manifest: true },
    server: { port: 5173, proxy: { '/api': 'http://localhost:8000' } },
  };
});
