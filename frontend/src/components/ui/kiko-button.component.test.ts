// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import KikoButton from './KikoButton.svelte';
import src from './KikoButton.svelte?raw';

afterEach(() => vi.useRealTimers());

describe('KikoButton', () => {
  it('bereaksi saat disentuh lalu kembali senang', async () => {
    vi.useFakeTimers();
    render(KikoButton);
    const btn = screen.getByRole('button', { name: 'Kiko senang' });
    await fireEvent.click(btn);
    expect(screen.getByRole('button', { name: 'Kiko semangat' }).className).toContain('is-happy');
    await vi.advanceTimersByTimeAsync(1300);
    expect(screen.getByRole('button', { name: 'Kiko senang' }).className).not.toContain('is-happy');
  });

  it('animasi dimatikan saat prefers-reduced-motion', () => {
    expect(src).toMatch(/prefers-reduced-motion: reduce\)\s*{[^}]*animation: none/);
  });
});
