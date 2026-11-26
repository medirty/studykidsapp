// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import UpdatePrompt from './UpdatePrompt.svelte';

test('prompt update: tersembunyi, tampil saat needRefresh, Muat ulang memanggil callback, Nanti menutup', async () => {
  const onreload = vi.fn();
  const { rerender } = render(UpdatePrompt, { needRefresh: false, onreload });
  expect(screen.queryByRole('status')).toBeNull();
  await rerender({ needRefresh: true, onreload });
  expect(screen.getByRole('status').textContent).toContain('Versi baru');
  await fireEvent.click(screen.getByRole('button', { name: 'Muat ulang' }));
  expect(onreload).toHaveBeenCalledOnce();
  await fireEvent.click(screen.getByRole('button', { name: 'Nanti' }));
  expect(screen.queryByRole('status')).toBeNull();
});
