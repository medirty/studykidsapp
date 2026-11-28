// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const speak = vi.hoisted(() => vi.fn());
vi.mock('../../src/services/speech', () => ({ speak }));

import Home from '../../src/routes/Home.svelte';
import { profile } from '../../src/stores/profile.svelte';

const setGrade = (grade: number) => {
  profile.list = [{ id: 'a', nickname: 'Dina', grade, avatarId: 'pipo' }] as typeof profile.list;
  profile.activeId = 'a';
};

beforeEach(() => {
  speak.mockReset();
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')));
});
afterEach(() => {
  profile.list = [];
  profile.activeId = null;
});

test('ubin: nama mapel, status Gratis/Terkunci (ikon + teks), ilustrasi dekoratif', async () => {
  setGrade(3);
  const { container } = render(Home);
  expect(await screen.findByRole('button', { name: /Math/ })).toBeTruthy();
  expect(screen.getAllByText('Gratis')).toHaveLength(3); // math, gp, art
  expect(screen.getAllByText('Terkunci')).toHaveLength(5);
  const imgs = container.querySelectorAll('.subject img');
  expect(imgs).toHaveLength(8);
  imgs.forEach((i) => expect(i.getAttribute('alt')).toBe(''));
});

test('kelas 1–2: mengetuk ubin membacakan nama mapel', async () => {
  setGrade(2);
  render(Home);
  await fireEvent.click(await screen.findByRole('button', { name: /Science/ }));
  expect(speak).toHaveBeenCalledWith('Science', 'id');
});

test('kelas 3+: ubin tidak membacakan apa pun', async () => {
  setGrade(3);
  render(Home);
  await fireEvent.click(await screen.findByRole('button', { name: /Science/ }));
  expect(speak).not.toHaveBeenCalled();
});
