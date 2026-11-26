// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import App from '../App.svelte';
import { getLocale, setLocale } from '../i18n';

test('header: toggle ID/EN mengganti locale; Landing tampil', async () => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')));
  setLocale('id');
  render(App);
  expect((await screen.findByRole('heading', { level: 1 })).textContent).toContain('Kiko');
  await fireEvent.click(screen.getByRole('button', { name: /Ganti bahasa/ }));
  expect(getLocale()).toBe('en');
  setLocale('id');
});
