# Rencana T3.7 — `session.ts`: sesi, adaptif, anti-repeat, spaced repetition + Dexie v2

Sumber: ADR D-014 (d), (e), (f); PRD FR-5 aturan 1–6 + AC offline, §12.2; rencana [phase-3.md](phase-3.md) T3.7. D-014 masih "diusulkan"; pertanyaan terbuka no. 1 (bank 20 item → fallback "paling lama") memakai default.

## Langkah (TDD: test merah dulu tiap langkah)
1. `engine/session.ts` (murni; waktu, id event, dan RNG lewat parameter/seed):
   - `sessionSize(grade)` (8 / 10), `levelFor(mastery)` (< 40 → 1, < 75 → 2, else 3).
   - `reviewSkills(others, now, count)`: skill lain yang sudah dilatih, mastery efektif turun ≥ 5 karena decay, urut efektif terendah.
   - `startSession(input)` → `SessionState`: counter = lama + 1, level awal dari mastery efektif, slot review `round(0,2 × ukuran)` di posisi acak ≠ 0 (RNG `rngFor(profileId, skillId, counter, 'plan')`).
   - `currentQuestion(state)` → `{ question, ref, hint }`: RNG soal `rngFor(profileId, skillUtama, counter, index)` (soal review juga diseed dari sesi utama → dapat direproduksi dari satu tuple); ref & format acak, format yang sudah 3× berturut-turut dilarang (kecuali ref hanya punya format itu); anti-repeat ≤ 20 percobaan, fallback "paling lama" lalu kandidat terakhir.
   - `answer(state, sq, given, durationMs, now, clientEventId)` → `{ correct, event, state }`: `checkAnswer`, `ProgressEvent` (tanpa fingerprint/seed), adaptif 2 benar → naik, 2 salah → turun + petunjuk pada soal skill utama berikutnya; soal review tidak menyentuh level/penghitung.
   - `historiesAfter(state)` → baris `SkillHistory` (idempoten: `recent` awal + fingerprint sesi ini, maks 5 sesi × 10); simpan setelah start (counter naik) dan setelah tiap jawaban (sesi yang ditinggal tetap tercatat).
2. `services/db.ts`: `version(2).stores({ skillHistory: '[profileId+skillId], profileId' })`, v1 tidak diedit. Test migrasi `tests/unit/db-migration.test.ts` (isi data v1 dengan Dexie mentah → buka `StudyKidsDb` → data utuh, `skillHistory` bisa ditulis).
3. `Api`: `listSkillHistory(profileId)`, `saveSkillHistory(rows)`; `deleteProfile` ikut menghapus `skillHistory`. Test di `local-api.test.ts`, termasuk satu sesi utuh dari konten `math.g1.u1` lewat `localApi` (tiap jawaban → `recordProgress` → `recordAndEnqueue`).
4. Catat penerapan di D-014 (f); `npm run check`, `test:scripts`, `test:e2e`; PROGRESS; commit.

## Di luar scope
Layar sesi & ringkasan (T3.16), mode game (`GameHost`, T3.22–T3.23: format tetap, tanpa review/rotasi — ditambahkan saat itu), sinkron `skillHistory` (lokal saja).
