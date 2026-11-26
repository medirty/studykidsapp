import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Engine/services diuji di environment node (PRD §15). Test komponen memilih jsdom
// per-file lewat komentar `// @vitest-environment jsdom` (ADR D-011 f, D-012).
export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  // Modul virtual vite-plugin-pwa tidak ada di Vitest.
  resolve: {
    alias: {
      'virtual:pwa-register': fileURLToPath(
        new URL('tests/stubs/pwa-register.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
