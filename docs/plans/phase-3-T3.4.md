# Rencana T3.4 — ADR engine soal & konten (D-014)

Sumber: PRD FR-4, FR-5, FR-6, FR-7, FR-9, FR-10 (AC konten Full), §6.2–6.5, §8.1, §8.4, §10.2, §11, §12.1–12.2; ADR D-007, D-011, D-013; `docs/plans/phase-3.md` T3.4–T3.7.

## Langkah
1. Test dulu (merah): `frontend/src/engine/types.test.ts` memakai contoh unit/indeks/soal 9 format dengan `satisfies` → `npm run typecheck` gagal karena `engine/types.ts` belum ada.
2. `frontend/src/engine/types.ts` — hanya tipe (konten, `Question` 9 format, `Answer`, `Generator`, `Rng`, `GameModule`, `SkillHistory`, `StreakState`). Hijau.
3. ADR **D-014** di `docs/DECISIONS.md` (status "diusulkan") butir a–k + dampak budget + pertanyaan terbuka.
4. `PROGRESS.md`: centang T3.4 + bukti, task berikutnya T3.5.
5. `npm run check`, commit, push, PR (tidak auto-merge: engine/skema → Bimo).

## Di luar scope (T3.5–T3.7)
`rng.ts`, generator, harness, loader, `mastery.ts`, `session.ts`, Dexie v2 nyata, perubahan `services/types.ts`, aturan 15 KB di `check-bundle-size`, `@vitest/coverage-v8`.
