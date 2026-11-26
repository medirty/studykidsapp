// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Avatar from './Avatar.svelte';
import Icon from './Icon.svelte';
import Kiko from './Kiko.svelte';
import { avatarIds } from './avatars';
import { iconPaths } from './icons';

describe('Icon', () => {
  it('dekoratif: aria-hidden, tanpa role', () => {
    const { container } = render(Icon, { name: 'star' });
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('role')).toBeNull();
  });

  it('bermakna: role img + label', () => {
    render(Icon, { name: 'lock', label: 'Terkunci' });
    expect(screen.getByRole('img', { name: 'Terkunci' })).toBeTruthy();
  });

  it('semua ikon punya path', () => {
    for (const d of Object.values(iconPaths)) expect(d.length).toBeGreaterThan(5);
  });
});

describe('Kiko & Avatar', () => {
  it('Kiko punya alt dari i18n', () => {
    render(Kiko, { mood: 'tidur' });
    expect(screen.getByRole('img', { name: 'Kiko tidur' })).toBeTruthy();
  });

  it('Avatar: nama sebagai alt, kosong jika dekoratif', () => {
    const { container } = render(Avatar, { id: 'zuzu' });
    expect(container.querySelector('img')!.getAttribute('alt')).toBe('zuzu');
    const deco = render(Avatar, { id: 'zuzu', decorative: true });
    expect(deco.container.querySelector('img')!.getAttribute('alt')).toBe('');
  });
});

describe('aset SVG', () => {
  const svgs = import.meta.glob('../../assets/{avatar,kiko}/*.svg', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>;

  it('ada 12 avatar', () => {
    expect(Object.keys(svgs).filter((f) => f.includes('/avatar/'))).toHaveLength(12);
    expect(avatarIds).toHaveLength(12);
  });

  it('tiap SVG ≤ 6 KB, tanpa <text>/<script>', () => {
    for (const [f, src] of Object.entries(svgs)) {
      expect(src.length, f).toBeLessThanOrEqual(6144);
      expect(src, f).not.toMatch(/<text|<script/);
    }
  });
});
