// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import App from '../../src/App.svelte';

test('App menampilkan judul sebagai heading (infrastruktur test komponen)', async () => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')));
  render(App);
  expect((await screen.findByRole('heading', { level: 1 })).textContent).not.toBe('');
});

test('judul tab mengikuti route', async () => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')));
  window.location.hash = '#/start';
  render(App);
  await vi.waitFor(() => expect(document.title).toMatch(/StudyKids$/));
  expect(document.title).toContain('Pilih kelas');
  window.location.hash = '#/home';
  await vi.waitFor(() => expect(document.title).toContain('Beranda'));
  window.location.hash = '#/';
  await vi.waitFor(() => expect(document.title).toContain('Belajar SD seru'));
});
