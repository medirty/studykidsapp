// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/svelte';
import 'fake-indexeddb/auto';
import { beforeAll, expect, test } from 'vitest';
import { profile } from '../stores/profile.svelte';
import Map from './Map.svelte';

beforeAll(async () => {
  await profile.create({ nickname: 'Dina', grade: 1, avatarId: 'pipo', locale: 'id' });
});

test('Map math: skill pertama menuju sesi, berikutnya terkunci (ikon + teks), status bukan warna saja', async () => {
  render(Map, { params: { subject: 'math' } });
  const first = await screen.findByRole('link', { name: /Menjumlah dua bilangan satu angka/ });
  expect(first.getAttribute('href')).toBe('#/session/math.g1.u1.s1');
  expect(screen.getAllByText('Selesaikan skill sebelumnya').length).toBeGreaterThan(0);
});

test('Map: tombol "Buka semua materi" membuka modal info', async () => {
  render(Map, { params: { subject: 'english' } });
  await fireEvent.click(await screen.findByRole('button', { name: 'Buka semua materi' }));
  expect(screen.getByRole('dialog')).toBeTruthy();
});

test('Map: mapel di luar demo terkunci; mapel tak dikenal = 404 ramah', async () => {
  const locked = render(Map, { params: { subject: 'english' } });
  expect(await screen.findByText('Pelajaran ini ada di paket lengkap.')).toBeTruthy();
  locked.unmount();
  render(Map, { params: { subject: 'nope' } });
  expect(screen.getByRole('heading', { name: /halaman tidak ketemu/ })).toBeTruthy();
});

test('Map: mapel demo tanpa konten kelas ini = "segera hadir"', async () => {
  render(Map, { params: { subject: 'gp' } });
  expect(await screen.findByText(/segera hadir/)).toBeTruthy();
});
