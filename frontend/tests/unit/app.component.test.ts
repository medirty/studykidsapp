// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import App from '../../src/App.svelte';
import { profile } from '../../src/stores/profile.svelte';

test('App menampilkan judul sebagai heading (infrastruktur test komponen)', async () => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')));
  render(App);
  expect((await screen.findByRole('heading', { level: 1 })).textContent).not.toBe('');
});

test('pesan ramah tampil di semua layar bila penyimpanan gagal', async () => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')));
  profile.failed = true;
  window.location.hash = '#/';
  render(App);
  expect((await screen.findByRole('alert')).textContent).toContain('Penyimpanan');
  profile.failed = false;
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

test('data-grade-band di root mengikuti kelas profil aktif', async () => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')));
  window.location.hash = '#/';
  const mk = (id: string, grade: number) => ({ id, nickname: id, grade, avatar: 'pipo' });
  profile.list = [mk('a', 1), mk('b', 4), mk('c', 6)] as typeof profile.list;
  render(App);
  const band = () => document.documentElement.dataset.gradeBand;
  for (const [id, want] of [
    ['a', 'lower'],
    ['b', 'middle'],
    ['c', 'upper'],
  ] as const) {
    profile.activeId = id;
    await vi.waitFor(() => expect(band()).toBe(want));
  }
  profile.activeId = null;
  await vi.waitFor(() => expect(band()).toBeUndefined());
  profile.list = [];
});
