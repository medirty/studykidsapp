# Rencana T3.5 — rng, registry, harness, `arith.add`, `bank`, loader, aturan 15 KB

Sumber: ADR D-014 (a, b, d, i, j, k), PRD FR-5 aturan 1–2 & 4 + AC, §6.4–6.5, §8.1, §15.1. D-014 masih "diusulkan": dipakai default tertulis (bank ≥ 20 item).

## Langkah (TDD: test merah dulu tiap langkah)
1. `engine/rng.ts`: `cyrb53`, `createRng` (mulberry32), `rngFor(...parts)` (seed `profileId|skillId|counter|index`), `fingerprint(type, core)` (hex, tanpa format).
2. `engine/generators/math/add.ts` (`arith.add`: `digits` 1–3, `regroup?`; level 1 = penjumlah 1 digit; format mcq/input/tf; distraktor: lupa menyimpan, ±1, ±10).
3. `engine/generators/bank.ts` (9 format; id `c/w/o/l/r/t/g` per soal; acak item, pilihan, urutan).
4. `engine/generators/registry.ts`: `getGenerator`, `makeQuestion` (isi `skillId`, `generator`, `fingerprint`), `checkAnswer`.
5. `engine/content.ts` (loader `import.meta.glob` lazy, `null` = terkunci) + `engine/content-check.ts` (validasi skema, dipakai test saja).
6. Test konten nyata (`content.test.ts`: skema, ID↔path, FR-10 demo saja, gzip ≤ 15 KB) + harness (`harness.test.ts`: semua skill di `content/` + fixture bank 20 item).
7. Contoh konten `content/math/g1/index.json` + `u1.json`.
8. `scripts/lib/bundle-size.mjs`: chunk `src/content/` ≤ 15 KB gzip (+ test node).
9. `@vitest/coverage-v8` (versi = vitest 5.1.1), threshold 80% `src/engine/**`, `test` = `vitest run --coverage`.
10. `npm run check`, PROGRESS, PR.

## Di luar scope
Penamaan chunk `assets/content/`, `globIgnores` precache, CacheFirst (D-014 i "Offline") → dikerjakan saat route pertama mengimpor `content.ts` (T3.14/T3.15); sebelum itu Vite tidak mengeluarkan chunk konten. Session/adaptif (T3.7), mastery (T3.6).
