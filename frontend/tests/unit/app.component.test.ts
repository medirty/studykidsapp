// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import App from '../../src/App.svelte';

test('App menampilkan judul sebagai heading (infrastruktur test komponen)', async () => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')));
  render(App);
  expect((await screen.findByRole('heading', { level: 1 })).textContent).not.toBe('');
});
