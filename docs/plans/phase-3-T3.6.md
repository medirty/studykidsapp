# Rencana T3.6 — `mastery.ts`: mastery, bintang, XP, streak

Sumber: ADR D-014 (g), PRD FR-7, FR-9, §12.2; rencana [phase-3.md](phase-3.md) T3.6. D-014 masih "diusulkan" dan pertanyaan terbuka no. 2 (XP salah = 2) & no. 3 (streak per tanggal perangkat) belum dijawab → dipakai default D-014.

## Langkah (TDD: test merah dulu tiap langkah)
1. `engine/mastery.ts` (murni, waktu sebagai parameter):
   - `masteryOf(events)` → `{ mastery, attempts }` (≤ 20 event dinilai terbaru, bobot 0,8^k, tanpa `draw`, urut `createdAt` lalu `clientEventId`).
   - `effectiveMastery(mastery, lastPracticedAt, now)` (grace 3 hari, waktu-paruh 30 hari).
   - `starsFor(mastery, attempts)`, `hasEnoughData(attempts)` (≥ 10).
   - `xpFor(event)` (benar/`draw` 10, salah 2), `sessionXp(events)`.
   - `localDay(date)`, `isoWeek(day)`, `nextStreak(state, day)` (1 hari libur per minggu ISO; tanpa status "hilang").
   - `nextSkillMastery(prev, events)` (bintang = max lama/baru), `applyEventToProfile(profile, event)` (XP + streak).
2. `services/types.ts`: `Profile.xp?`, `Profile.streak?` (dimiliki `recordProgress`, baris lama = default), `SkillMastery.stars`.
3. `services/sync.ts` `recordAndEnqueue(db, event)`: dalam satu transaksi hitung ulang mastery dari event skill itu + update XP/streak profil. `Api.recordProgress(event)` tanpa argumen mastery (klien & server menghitung dari event yang sama, §12.2).
4. `services/api.ts` `saveProfile`: baris yang sudah ada di-`update` (merge) agar XP/streak tidak tertimpa salinan profil lama di store.
5. Update `tests/unit/local-api.test.ts` + `tests/e2e/local-data.spec.ts`; catat di D-014 (g); `npm run check`; PROGRESS; PR.

## Di luar scope
Session/adaptif + Dexie v2 (T3.7), tampilan bintang/XP/streak & teks ajakan i18n (layar T3.16+), fixture JSON kasus untuk PHP (Fase 4).
