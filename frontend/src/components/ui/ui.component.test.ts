// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button.svelte';
import Card from './Card.svelte';
import Chip from './Chip.svelte';
import Modal from './Modal.svelte';
import ProgressBar from './ProgressBar.svelte';
import Stars from './Stars.svelte';
import SubjectCard from './SubjectCard.svelte';

const text = (s: string) => createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

describe('Button', () => {
  it('role button, klik memanggil handler', async () => {
    const onclick = vi.fn();
    render(Button, { children: text('Main'), onclick });
    await fireEvent.click(screen.getByRole('button', { name: 'Main' }));
    expect(onclick).toHaveBeenCalledOnce();
  });

  it('disabled memakai atribut native; large menambah kelas', () => {
    render(Button, { children: text('X'), disabled: true, large: true });
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.classList.contains('large')).toBe(true);
  });
});

describe('Card, Chip', () => {
  it('Card menampilkan isi', () => {
    render(Card, { children: text('Isi') });
    expect(screen.getByText('Isi')).toBeTruthy();
  });

  it('Chip terpilih: ada ikon ✓ (bukan warna saja)', () => {
    const { container } = render(Chip, { selected: true, children: text('Dipilih') });
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelector('.selected')).toBeTruthy();
  });

  it('Chip status: ikon + teks', () => {
    const { container } = render(Chip, { icon: 'lock', children: text('Terkunci') });
    expect(container.querySelector('svg')).toBeTruthy();
    expect(screen.getByText('Terkunci')).toBeTruthy();
  });
});

describe('ProgressBar & Stars', () => {
  it('progressbar: nilai & label, nilai dibatasi 0–100%', () => {
    const { container } = render(ProgressBar, { value: 3, max: 10, label: 'Soal' });
    const bar = screen.getByRole('progressbar', { name: 'Soal' });
    expect(bar.getAttribute('aria-valuenow')).toBe('3');
    expect(container.querySelector<HTMLElement>('.fill')!.style.width).toBe('30%');
  });

  it('Stars: label i18n & jumlah bintang menyala', () => {
    const { container } = render(Stars, { value: 2 });
    expect(screen.getByRole('img', { name: '2 dari 3 bintang' })).toBeTruthy();
    expect(container.querySelectorAll('.on')).toHaveLength(2);
    expect(container.querySelectorAll('svg')).toHaveLength(3);
  });
});

describe('SubjectCard', () => {
  it('memakai token warna mapel; terkunci = ikon + teks', () => {
    const { container } = render(SubjectCard, {
      subject: 'math',
      title: 'Matematika',
      locked: true,
    });
    expect(screen.getByRole('button', { name: /Matematika/ })).toBeTruthy();
    expect(container.querySelector<HTMLElement>('.subject')!.getAttribute('style')).toContain(
      '--subject-math',
    );
    expect(screen.getByText('Terkunci')).toBeTruthy();
    expect(container.querySelector('svg')).toBeTruthy();
  });
});

describe('Modal', () => {
  it('dialog bernama, fokus masuk, Esc menutup', async () => {
    const onclose = vi.fn();
    render(Modal, { title: 'Judul', onclose, children: text('Isi') });
    const dialog = screen.getByRole('dialog', { name: 'Judul' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Tutup' }));
    await fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onclose).toHaveBeenCalledOnce();
  });

  it('Tab dari elemen terakhir berputar ke awal', async () => {
    const onclose = vi.fn();
    render(Modal, { title: 'Judul', onclose, children: text('Isi') });
    const dialog = screen.getByRole('dialog');
    const close = screen.getByRole('button', { name: 'Tutup' });
    close.focus();
    const ok = await fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(ok).toBe(false); // preventDefault dipanggil: fokus dijaga di dalam
    expect(document.activeElement).toBe(close);
  });

  it('fokus kembali ke pemicu saat ditutup', () => {
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const { unmount } = render(Modal, { title: 'J', onclose: () => {}, children: text('x') });
    expect(document.activeElement).not.toBe(opener);
    unmount();
    expect(document.activeElement).toBe(opener);
  });
});

describe('tanpa hex di komponen', () => {
  const sources = import.meta.glob('./*.svelte', { query: '?raw', import: 'default', eager: true });
  it('warna hanya lewat token', () => {
    for (const [f, src] of Object.entries(sources)) {
      expect(src as string, f).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/);
    }
  });
});
