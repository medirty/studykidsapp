import { defineConfig } from 'vitest/config';

// Engine murni diuji di environment node (PRD §15). Test komponen: ADR baru nanti.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
