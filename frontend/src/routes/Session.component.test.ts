// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import 'fake-indexeddb/auto';
import { beforeAll, expect, test } from 'vitest';
import { openDb } from '../services/db';
import { profile } from '../stores/profile.svelte';
import Session from './Session.svelte';

beforeAll(async () => {
  await profile.create({ nickname: 'Dina', grade: 1, avatarId: 'pipo', locale: 'id' });
});

/** Answers with the first choice / key: any format of math.g1.u1.s1 (mcq, input, tf) accepts it. */
async function answerOne() {
  const check = await screen.findByRole('button', { name: 'Periksa' });
  const first = screen.getAllByRole('button').find((b) => b !== check)!;
  await fireEvent.click(first);
  await fireEvent.click(check);
  await fireEvent.click(await screen.findByRole('button', { name: 'Lanjut' }));
}

test('Session: 8 soal kelas 1 → ringkasan; progres + antrian sinkron tersimpan', async () => {
  render(Session, { params: { skillId: 'math.g1.u1.s1' } });
  expect(await screen.findByText('Soal 1 dari 8')).toBeTruthy();
  for (let i = 0; i < 8; i++) await answerOne();
  expect(await screen.findByRole('heading', { name: 'Kerja bagus, Dina!' })).toBeTruthy();
  const db = await openDb();
  await waitFor(async () => expect(await db.progressEvents.count()).toBe(8));
  expect(await db.syncQueue.count()).toBe(8);
  expect((await db.skillHistory.toArray()).length).toBeGreaterThan(0);
});

test('Session: skill yang tidak ada / terkunci = pesan ramah, bukan error', async () => {
  render(Session, { params: { skillId: 'math.g1.u9.s1' } });
  expect(await screen.findByText('Pelajaran ini belum bisa dibuka.')).toBeTruthy();
});

test('Session: Periksa nonaktif sampai ada jawaban', async () => {
  render(Session, { params: { skillId: 'math.g1.u1.s1' } });
  const check = await screen.findByRole('button', { name: 'Periksa' });
  expect((check as HTMLButtonElement).disabled).toBe(true);
});
