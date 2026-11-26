import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { brand } from './src/brand.config';

// Env frontend (VITE_*) ada di .env root (ADR D-001, D-003).
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, '..', 'VITE_');
  return {
    base: env.VITE_BASE || '/',
    envDir: '..',
    // Dev server selalu ditemani API (npm run dev); build/preview ikut .env (Pages = local).
    define: command === 'serve' ? { 'import.meta.env.VITE_API_MODE': '"api"' } : {},
    plugins: [
      svelte(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.svg'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,woff2,svg,png}'],
          navigateFallback: 'index.html',
        },
        manifest: {
          name: brand.name,
          short_name: brand.name,
          lang: 'id',
          display: 'standalone',
          // Relatif terhadap base, jadi benar di /studykidsapp/ maupun /.
          start_url: '.',
          scope: '.',
          theme_color: brand.colors.primary,
          background_color: '#fff8f2',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'icons/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
    build: { manifest: true },
    server: { port: 5173, proxy: { '/api': 'http://localhost:8000' } },
  };
});
