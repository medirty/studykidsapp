// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import en from './en.json';
import id from './id.json';
import { getLocale, setLocale, t } from './index';

describe('katalog pesan', () => {
  it('key ID sama dengan key EN', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(id).sort());
  });

  it('tidak ada nilai kosong', () => {
    for (const v of [...Object.values(id), ...Object.values(en)]) expect(v.trim()).not.toBe('');
  });
});

describe('locale reaktif', () => {
  beforeEach(() => setLocale('id'));

  it('mengganti teks, <html lang>, dan tersimpan', () => {
    expect(t('hello.status')).toBe(id['hello.status']);
    setLocale('en');
    expect(t('hello.status')).toBe(en['hello.status']);
    expect(document.documentElement.lang).toBe('en');
    expect(getLocale()).toBe('en');
    expect(localStorage.getItem('sk.locale')).toBe('en');
  });

  it('mengisi parameter', () => {
    expect(t('hello.subtitle', { brand: 'X' })).toContain('X');
  });
});

// Penjaga teks hardcode (FR-3): teks literal di markup .svelte harus lewat t().
export function findHardcodedText(source: string): string[] {
  const markup = source
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\{(?:[^{}]|\{[^{}]*\})*\}/g, '');
  return [...markup.matchAll(/>([^<>]*\p{L}[^<>]*)</gu)].map((m) => (m[1] ?? '').trim());
}

const components = import.meta.glob('../**/*.svelte', {
  query: '?raw',
  import: 'default',
  eager: true,
});

describe('penjaga teks hardcode', () => {
  it('menandai teks literal', () => {
    expect(findHardcodedText('<p>Halo</p>')).toEqual(['Halo']);
    expect(findHardcodedText('<p>{t("a")}</p><script>let x = "a<b";</script>')).toEqual([]);
  });

  it('tidak ada teks literal di komponen', () => {
    for (const [file, source] of Object.entries(components)) {
      expect(findHardcodedText(source as string), file).toEqual([]);
    }
  });
});
