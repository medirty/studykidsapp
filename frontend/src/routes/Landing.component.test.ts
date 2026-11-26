// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import { setLocale } from '../i18n';
import Landing from './Landing.svelte';

test('Landing: CTA ke pilih kelas, harga dari config lokal, soal contoh', async () => {
  setLocale('id');
  render(Landing);
  expect(screen.getByRole('link', { name: 'Coba Gratis' }).getAttribute('href')).toBe('#/start');
  expect(await screen.findByText(/Harga early bird Rp50\.000\/bulan/)).toBeTruthy();
  expect(screen.queryByText(/Sisa .* slot/)).toBeNull(); // mode lokal: penghitung tersembunyi
  expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(8);

  await fireEvent.click(screen.getByRole('button', { name: '8' }));
  expect(screen.getByRole('status').textContent).toContain('Coba lagi');
  await fireEvent.click(screen.getByRole('button', { name: '9' }));
  expect(screen.getByRole('status').textContent).toContain('Benar');
});

test('Landing: teks mengikuti bahasa', () => {
  setLocale('en');
  render(Landing);
  expect(screen.getByRole('link', { name: 'Try for Free' })).toBeTruthy();
  setLocale('id');
});
