# PROGRESS — StudyKids

> Wajib di-update setiap akhir sesi. Rencana detail per fase: `docs/plans/phase-<n>.md`.
> Tag model: `[opus]` → `/next` mendelegasikan ke subagent `architect`; `[sonnet]` → dikerjakan sesi utama.

## Status

- **Fase aktif:** 0 — Setup
- **Posisi terakhir:** rencana Fase 0 dibuat (21 Nov 2026). Task berikutnya: **T0.0 Bootstrap**, lalu T0.1.
- **Persetujuan fase:** belum ada.

## Fase 0 — Setup (rencana: `docs/plans/phase-0.md`)

### Sudah selesai (sesi pembuka, 21 Nov 2026)
- [x] Hubungkan folder ke `github.com/medirty/studykidsapp`, `.gitignore`, `.gitattributes`, `LICENSE` — commit `6f4eca6` di `main`
- [x] `.claude/` routing model (opusplan + 4 subagent + 5 command) sudah ada
- [x] `gh` CLI terpasang & login
- [x] `docs/PROGRESS.md` + `docs/plans/phase-0.md`

### Task
- [ ] T0.0 `[sonnet]` **Bootstrap tooling** — jalankan `docs/setup/BOOTSTRAP.md` (cek software, install plugin/skill/MCP otomatis, settings.json + hook) — **kerjakan pertama**
- [ ] T0.1 `[sonnet]` `docs/SETUP_LOCAL.md` + `scripts/doctor.mjs` (§17.1) — doctor juga cek item BOOTSTRAP Langkah 1–4, mode `--quiet`
- [ ] T0.2 `[sonnet]` Kerangka dokumen: README, DECISIONS, CHANGELOG, CHANGE_REQUESTS, ASSET_LICENSES, `.env.example` (§11, §18)
- [ ] T0.3 `[opus]` ADR layout repo, kontrak script & env, daftar dependency + lisensi (§10, §11, §8.1) — **catat bukti delegasi `/next` → architect (E4)**
- [ ] T0.4 `[sonnet]` Scaffold frontend Svelte 5 + Vite + TS strict, struktur folder, hello-world, `VITE_BASE` (§10.1, §11, §17.5)
- [ ] T0.5 `[sonnet]` ESLint/Prettier/svelte-check/Vitest + `check-bundle-size` + `npm run check` (§8.1, §15)
- [ ] T0.6 `[sonnet]` Playwright (Pixel 5, iPhone 12, desktop) + axe-core smoke test (§15.1)
- [ ] T0.7 `[opus]` Scaffold backend Slim 4 + PDO + `/api/health` + PHPUnit/PHPStan/CS-Fixer (§10.1, §11, §8.3) — butuh B2, B3
- [ ] T0.8 `[opus]` Phinx + `npm run db:reset` dengan pengaman env (§17.1) — butuh B4
- [ ] T0.9 `[sonnet]` `npm run dev` (concurrently + proxy `/api`) → status API & DB tampil (§17.1)
- [ ] T0.10 `[sonnet]` CI (`ci.yml`, MySQL service, PHP 8.2/8.4, Lighthouse CI) + Dependabot (§15.1, §17.3)
- [ ] T0.11 `[sonnet]` `deploy-pages.yml` → hello-world di GitHub Pages (§17.5) — butuh B6
- [ ] T0.12 `[sonnet]` Verifikasi plugin/MCP + rangkum bukti Exit Criteria (§16.2, §16.4)
- [ ] Gate `[opus]` `/gate` → Bimo menulis "Fase 0 disetujui" → tag `phase-0-approved`

### Tindakan manual Bimo
- [ ] B1 Beli domain `studykids.id`
- [x] B2 PHP 8.4.28 di `C:\php-8.4`, 8 ekstensi aktif (21 Nov 2026). PATH sistem tidak diubah — pakai `PHP_BIN`
- [ ] B3 Start MySQL di XAMPP setiap mulai kerja (PATH `mysql` diurus T0.0)
- [ ] B4 User MySQL `studykids` + DB `studykids_dev` & `studykids_test`; isi `backend/.env`
- [ ] B5 Aktifkan Secret scanning & Push protection di repo
- [ ] B6 Pages → Source: GitHub Actions
- [ ] B7 Setujui instalasi plugin/skill/MCP saat T0.0 berjalan (dipasang otomatis oleh Claude)
- [ ] B8 Proteksi branch `main` (setelah T0.10)

### Bukti Exit Criteria
| Kriteria | Bukti |
|---|---|
| E1 `npm run check` & `composer test` hijau di CI | — |
| E2 `npm run dev` → frontend + API + DB lokal | — |
| E3 Hello-world di GitHub Pages | — |
| E4 `/next` mendelegasikan `[opus]` ke architect | — |

### Pertanyaan terbuka untuk Bimo
1. ~~Path PHP~~ — **terjawab:** `C:\php-8.4` (CLAUDE.md & PRD v1.5 sudah sama).
2. Merge PR: Bimo yang merge, atau Claude boleh merge sendiri setelah CI hijau?
3. ~~claude-mem~~ — **terjawab (PRD v1.6):** tidak dipakai. Memori project = PROGRESS.md, DECISIONS.md, docs/plans, Git.
