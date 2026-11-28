// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Choice, QuestionOf } from '../../engine/types';
import { setLocale } from '../../i18n';
import DragDrop from './DragDrop.svelte';
import Draw from './Draw.svelte';
import Match from './Match.svelte';
import Order from './Order.svelte';

const base = {
  skillId: 's',
  generator: 'g',
  level: 1 as const,
  prompt: { id: 'Soal', en: 'Question' },
  core: {},
  fingerprint: 'f',
};
const ch = (...ids: string[]): Choice[] => ids.map((id) => ({ id, text: { id, en: id } }));
const btn = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name}`) });

beforeEach(() => setLocale('id'));

describe('Order', () => {
  const q = { ...base, format: 'order', answer: ['a', 'b', 'c'], items: ch('c', 'a', 'b') };

  it('ketuk berurutan → nomor; baru dikirim bila lengkap; ketuk bernomor = batal', async () => {
    const onchange = vi.fn();
    render(Order, { question: q as QuestionOf<'order'>, onchange });
    await fireEvent.click(btn('a'));
    await fireEvent.click(btn('b'));
    expect(onchange).toHaveBeenLastCalledWith(null);
    expect(btn('a').textContent).toContain('1');
    await fireEvent.click(btn('c'));
    expect(onchange).toHaveBeenLastCalledWith(['a', 'b', 'c']);
    await fireEvent.click(btn('b'));
    expect(onchange).toHaveBeenLastCalledWith(null);
    expect(btn('c').textContent).toContain('2');
  });
});

describe('Match', () => {
  const q = {
    ...base,
    format: 'match',
    answer: { l1: 'r1', l2: 'r2' },
    left: ch('l1', 'l2'),
    right: ch('r2', 'r1'),
  };

  it('kanan mati sampai kiri dipilih; pasangan lengkap dikirim sebagai peta', async () => {
    const onchange = vi.fn();
    render(Match, { question: q as QuestionOf<'match'>, onchange });
    expect((btn('r1') as HTMLButtonElement).disabled).toBe(true);
    await fireEvent.click(btn('l1'));
    await fireEvent.click(btn('r1'));
    expect(onchange).toHaveBeenLastCalledWith(null);
    await fireEvent.click(btn('l2'));
    await fireEvent.click(btn('r2'));
    expect(onchange).toHaveBeenLastCalledWith({ l1: 'r1', l2: 'r2' });
  });

  it('kanan yang dipakai diambil alih; kiri berpasangan diketuk melepas pasangan', async () => {
    const onchange = vi.fn();
    render(Match, { question: q as QuestionOf<'match'>, onchange });
    await fireEvent.click(btn('l1'));
    await fireEvent.click(btn('r1'));
    await fireEvent.click(btn('l2'));
    await fireEvent.click(btn('r1'));
    await fireEvent.click(btn('l1'));
    await fireEvent.click(btn('r2'));
    expect(onchange).toHaveBeenLastCalledWith({ l2: 'r1', l1: 'r2' });
    await fireEvent.click(btn('l2'));
    expect(onchange).toHaveBeenLastCalledWith(null);
  });
});

describe('DragDrop', () => {
  const q = {
    ...base,
    format: 'dragdrop',
    answer: { apel: 'buah', bayam: 'sayur' },
    items: ch('apel', 'bayam'),
    targets: ch('buah', 'sayur'),
  };

  it('pilih benda lalu ketuk tempat; lengkap dikirim; ketuk yang ditaruh = kembali', async () => {
    const onchange = vi.fn();
    render(DragDrop, { question: q as QuestionOf<'dragdrop'>, onchange });
    expect((btn('buah') as HTMLButtonElement).disabled).toBe(true);
    await fireEvent.click(btn('apel'));
    await fireEvent.click(btn('buah'));
    expect(onchange).toHaveBeenLastCalledWith(null);
    await fireEvent.click(btn('bayam'));
    await fireEvent.click(btn('sayur'));
    expect(onchange).toHaveBeenLastCalledWith({ apel: 'buah', bayam: 'sayur' });
    await fireEvent.click(btn('apel'));
    expect(onchange).toHaveBeenLastCalledWith(null);
  });

  it('disabled mematikan semua tombol', () => {
    render(DragDrop, { question: q as QuestionOf<'dragdrop'>, onchange: vi.fn(), disabled: true });
    for (const b of screen.getAllByRole('button'))
      expect((b as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('Draw', () => {
  it('Selesai mengirim "done" tanpa perlu menggambar (tidak dinilai)', async () => {
    const onchange = vi.fn();
    render(Draw, {
      question: { ...base, format: 'draw', answer: 'done' } as QuestionOf<'draw'>,
      onchange,
    });
    expect(screen.getByLabelText('Kertas gambar')).toBeTruthy();
    await fireEvent.click(screen.getByRole('button', { name: 'Selesai' }));
    expect(onchange).toHaveBeenCalledWith('done');
  });
});
