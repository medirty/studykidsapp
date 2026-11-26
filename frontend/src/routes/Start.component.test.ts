// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/svelte';
import 'fake-indexeddb/auto';
import { expect, test } from 'vitest';
import Start from './Start.svelte';

test('Start: tanpa nama/kelas → pesan error; 12 avatar tersedia', async () => {
  render(Start);
  expect(document.querySelectorAll('input[name="avatar"]')).toHaveLength(12);
  expect(document.querySelectorAll('input[name="grade"]')).toHaveLength(6);
  await fireEvent.click(screen.getByRole('button', { name: 'Mulai belajar' }));
  expect(screen.getByRole('alert')).toBeTruthy();
});
