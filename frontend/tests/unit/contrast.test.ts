import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/styles/tokens.css', 'utf8');

function token(name: string): string {
  const m = css.match(new RegExp('--' + name + ':[ ]*(#[0-9a-f]{6})', 'i'));
  if (!m) throw new Error(`token --${name} tidak ditemukan`);
  return m[1];
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [teks, latar, minimal]. 4.5 = teks biasa, 3 = teks besar/tebal (>= 24px, atau >= 18.66px bold) & ikon.
const TEXT_PAIRS: [string, string, number][] = [
  ['color-ink', 'color-bg', 4.5],
  ['color-ink', 'color-surface', 4.5],
  ['color-ink-soft', 'color-bg', 4.5],
  ['color-ink-soft', 'color-surface', 4.5],
  ['color-ink', 'color-primary', 4.5],
  ['color-ink', 'color-sunny', 4.5],
  ['color-ink', 'color-teal', 4.5],
  ['color-ink', 'color-bubblegum', 4.5],
  ['color-ink-on-dark', 'color-ink', 4.5],
  ['color-error', 'color-surface', 4.5],
  ['color-error', 'color-bg', 3],
  ['color-success', 'color-surface', 3],
  ['color-success', 'color-bg', 3],
];

// Warna mapel = latar ikon/kartu; teks di atasnya Ink atau putih (mana yang lolos 4.5:1).
const SUBJECTS = ['math', 'english', 'science', 'gp', 'wellbeing', 'art', 'music', 'computing'];

function subjectForeground(subject: string): 'ink' | 'white' | null {
  const bg = token(`subject-${subject}`);
  if (contrast(token('color-ink'), bg) >= 4.5) return 'ink';
  if (contrast('#ffffff', bg) >= 4.5) return 'white';
  return null;
}

describe('kontras WCAG AA', () => {
  it.each(TEXT_PAIRS)('%s di atas %s >= %f:1', (fg, bg, min) => {
    expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(min);
  });

  it.each(SUBJECTS.filter((s) => s !== 'english'))(
    'mapel %s punya warna teks (Ink/putih) >= 4.5:1',
    (s) => {
      expect(subjectForeground(s)).not.toBeNull();
    },
  );

  // Pengecualian tercatat (docs/brand/tokens.md): English #8B5CF6 hanya lolos 3:1 -> teks putih wajib besar/tebal.
  it('mapel english: putih >= 3:1 (khusus teks besar/tebal)', () => {
    expect(contrast('#ffffff', token('subject-english'))).toBeGreaterThanOrEqual(3);
  });
});
