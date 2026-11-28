// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Choice, QuestionOf } from '../../engine/types';
import { setLocale } from '../../i18n';
import Input from './Input.svelte';
import Listen from './Listen.svelte';
import Mcq from './Mcq.svelte';
import Tap from './Tap.svelte';
import Tf from './Tf.svelte';

const base = {
  skillId: 's',
  generator: 'g',
  level: 1 as const,
  prompt: { id: 'Berapa 3 + 4?', en: 'What is 3 + 4?' },
  core: {},
  fingerprint: 'f',
};
const choices: Choice[] = ['6', '7', '8'].map((v) => ({ id: v, text: { id: v, en: v } }));

const mcq = { ...base, format: 'mcq', answer: '7', choices } as QuestionOf<'mcq'>;
const tap = { ...base, format: 'tap', answer: ['6', '7'], choices } as QuestionOf<'tap'>;
const tf = { ...base, format: 'tf', answer: true } as QuestionOf<'tf'>;
const listen = {
  ...base,
  format: 'listen',
  answer: '6',
  speak: { id: 'kucing', en: 'cat' },
  choices,
} as QuestionOf<'listen'>;
const input = (inputMode: 'numeric' | 'text') =>
  ({ ...base, format: 'input', answer: '7', inputMode }) as QuestionOf<'input'>;

beforeEach(() => setLocale('id'));

describe('Mcq', () => {
  it('memilih mengirim id, terpilih = aria-pressed + ikon ✓, bisa ganti pilihan', async () => {
    const onchange = vi.fn();
    const { container } = render(Mcq, { question: mcq, onchange });
    const seven = screen.getByRole('button', { name: '7' });
    expect(seven.getAttribute('aria-pressed')).toBe('false');
    await fireEvent.click(seven);
    expect(onchange).toHaveBeenLastCalledWith('7');
    expect(seven.getAttribute('aria-pressed')).toBe('true');
    expect(seven.querySelector('svg')).toBeTruthy();
    await fireEvent.click(screen.getByRole('button', { name: '8' }));
    expect(onchange).toHaveBeenLastCalledWith('8');
    expect(seven.getAttribute('aria-pressed')).toBe('false');
    expect(container.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);
  });

  it('teks soal mengikuti bahasa (ID = EN)', () => {
    render(Mcq, { question: mcq, onchange: vi.fn() });
    expect(screen.getByRole('heading').textContent).toBe('Berapa 3 + 4?');
  });

  it('disabled mematikan semua pilihan', () => {
    render(Mcq, { question: mcq, onchange: vi.fn(), disabled: true });
    for (const b of screen.getAllByRole('button', { pressed: false })) {
      expect((b as HTMLButtonElement).disabled).toBe(true);
    }
  });
});

describe('Tf', () => {
  it('Benar → true, Salah → false, label i18n', async () => {
    const onchange = vi.fn();
    render(Tf, { question: tf, onchange });
    await fireEvent.click(screen.getByRole('button', { name: 'Benar' }));
    expect(onchange).toHaveBeenLastCalledWith(true);
    await fireEvent.click(screen.getByRole('button', { name: 'Salah' }));
    expect(onchange).toHaveBeenLastCalledWith(false);
  });

  it('label bahasa Inggris', () => {
    setLocale('en');
    render(Tf, { question: tf, onchange: vi.fn() });
    expect(screen.getByRole('button', { name: 'True' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'False' })).toBeTruthy();
  });
});

describe('Tap', () => {
  it('jawaban = himpunan pilihan; ketuk lagi membatalkan; kosong = null', async () => {
    const onchange = vi.fn();
    render(Tap, { question: tap, onchange });
    await fireEvent.click(screen.getByRole('button', { name: '6' }));
    await fireEvent.click(screen.getByRole('button', { name: '7' }));
    expect(onchange).toHaveBeenLastCalledWith(['6', '7']);
    await fireEvent.click(screen.getByRole('button', { name: '6' }));
    expect(onchange).toHaveBeenLastCalledWith(['7']);
    await fireEvent.click(screen.getByRole('button', { name: '7' }));
    expect(onchange).toHaveBeenLastCalledWith(null);
  });
});

describe('Listen', () => {
  it('menampilkan pesan ramah suara & memilih mengirim id', async () => {
    const onchange = vi.fn();
    render(Listen, { question: listen, onchange });
    expect(screen.getByText(/Tidak ada suara/)).toBeTruthy();
    await fireEvent.click(screen.getByRole('button', { name: '6' }));
    expect(onchange).toHaveBeenCalledWith('6');
  });
});

describe('Input', () => {
  it('keypad: ketik, hapus, kosong = null', async () => {
    const onchange = vi.fn();
    render(Input, { question: input('numeric'), onchange });
    const box = screen.getByRole('status', { name: 'Jawabanmu' });
    expect(box.textContent).toBe('?');
    await fireEvent.click(screen.getByRole('button', { name: '1' }));
    await fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(box.textContent).toBe('12');
    expect(onchange).toHaveBeenLastCalledWith('12');
    await fireEvent.click(screen.getByRole('button', { name: 'Hapus' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Hapus' }));
    expect(box.textContent).toBe('?');
    expect(onchange).toHaveBeenLastCalledWith(null);
  });

  it('papan ketik fisik dari keypad, dan dibatasi 9 digit', async () => {
    const onchange = vi.fn();
    render(Input, { question: input('numeric'), onchange });
    const key = screen.getByRole('button', { name: '5' });
    await fireEvent.keyDown(key, { key: '4' });
    expect(onchange).toHaveBeenLastCalledWith('4');
    await fireEvent.keyDown(key, { key: 'Backspace' });
    expect(onchange).toHaveBeenLastCalledWith(null);
    for (let i = 0; i < 12; i++) await fireEvent.click(key);
    expect(onchange).toHaveBeenLastCalledWith('555555555');
  });

  it('disabled: keypad tidak mengubah jawaban', async () => {
    const onchange = vi.fn();
    render(Input, { question: input('numeric'), onchange, disabled: true });
    await fireEvent.keyDown(screen.getByRole('button', { name: '5' }), { key: '4' });
    expect(onchange).not.toHaveBeenCalled();
  });

  it('inputMode text memakai kotak teks berlabel', async () => {
    const onchange = vi.fn();
    render(Input, { question: input('text'), onchange });
    await fireEvent.input(screen.getByRole('textbox', { name: 'Ketik jawabanmu' }), {
      target: { value: 'kucing' },
    });
    expect(onchange).toHaveBeenLastCalledWith('kucing');
    expect(screen.queryByRole('status')).toBeNull();
  });
});
