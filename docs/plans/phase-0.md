# Rencana Fase 0 — Setup

Sumber: PRD §14 (baris Fase 0), §10.1, §11, §15, §16.2–16.4, §17.1, §17.5.
Dibuat: 21 Nov 2026 lewat `/plan-phase`. Checklist ringkas ada di `docs/PROGRESS.md`.

## Exit Criteria (PRD §14)

| # | Kriteria | Dibuktikan oleh task |
|---|---|---|
| E1 | `npm run check` & `composer test` hijau di CI | T0.5, T0.7, T0.10 |
| E2 | `npm run dev` menjalankan frontend + API + koneksi DB lokal | T0.8, T0.9 (+ B2–B4 oleh Bimo) |
| E3 | Hello-world tampil di GitHub Pages | T0.11 (+ B6) |
| E4 | `/next` berjalan dan mendelegasikan task `[opus]` ke subagent `architect` | bukti dicatat saat T0.3 dikerjakan lewat `/next` |

## Sudah selesai di sesi 21 Nov 2026

- Repo lokal di-`git init` dan dihubungkan ke `github.com/medirty/studykidsapp` (repo masih kosong, jadi init + push setara dengan "clone lalu pindahkan" di §17.5).
- `.gitignore` (§17.5 + `.claude/settings.local.json`), `.gitattributes` (LF), `LICENSE` "All rights reserved".
- `.claude/` sudah ada (routing `opusplan`, 4 subagent, 5 command) — tidak perlu rename `claude-setup/`.
- `gh` CLI terpasang & login sebagai `medirty`.
- Brief awal dipindah ke `docs/BRIEF_AWAL.txt` (nama file asli terlalu panjang untuk Git di Windows).

## Task (urut dependensi)

Setiap task = 1 sesi `/next`, 1 branch (`chore/f0-...` / `docs/f0-...` / `feat/f0-...`), 1 PR.

### T0.1 `[sonnet]` Panduan setup lokal + `scripts/doctor`
- **Tujuan:** Bimo bisa menyiapkan laptop klik-demi-klik; satu perintah mengecek kesiapan.
- **PRD:** §17.1 ("Fase 0, task pertama").
- **Isi:** `docs/SETUP_LOCAL.md` (install PHP 8.4 bersih, ekstensi php.ini, PATH, XAMPP MySQL, buat user `studykids` + DB `studykids_dev`/`studykids_test`, `backend/.env`). `scripts/doctor.mjs` (Node, tanpa dependency) cek: PHP ≥ 8.4 & ekstensi wajib, Node ≥ 22, Composer, `mysql` di PATH, koneksi MySQL, port 5173/8000 bebas.
- **AC:** `node scripts/doctor.mjs` menampilkan ✓/✗ per item dengan saran perbaikan; exit code ≠ 0 bila ada ✗.

### T0.2 `[sonnet]` Kerangka dokumen proyek
- **PRD:** §11 (docs/), §17.5, §18.
- **Isi:** `README.md` (ringkas + cara mulai), `docs/DECISIONS.md`, `docs/CHANGELOG.md`, `docs/CHANGE_REQUESTS.md` (template §18), `docs/ASSET_LICENSES.md` (entri konsep logo), `.env.example` root & `backend/.env.example` (tanpa nilai asli).
- **AC:** semua file ada; tidak ada nilai rahasia; link antar dokumen benar.

### T0.3 `[opus]` Keputusan arsitektur repo & tooling (ADR)
- **PRD:** §10, §11, §8.1, §17.1, §17.5.
- **Isi:** ADR di `DECISIONS.md`: (a) layout npm — root `package.json` + `frontend/` (workspaces atau tidak); (b) kontrak script root: `dev`, `check`, `build`, `test:e2e`, `db:reset`, `doctor`; (c) kontrak env `VITE_BASE`, `VITE_API_MODE=local|remote`, base URL `/api`; (d) daftar dependency Fase 0 + lisensi + ukuran (svelte, vite, svelte-spa-router, concurrently, eslint, prettier, vitest, playwright, @axe-core/playwright, slim, php-di?, phinx, phpdotenv?, phpunit, phpstan, php-cs-fixer); (e) cara cek budget bundle (§8.1).
- **AC:** ADR disetujui di PR; dipakai sebagai acuan T0.4–T0.11. **Bukti E4:** catat di PROGRESS bahwa `/next` mendelegasikan task ini ke `architect`.

### T0.4 `[sonnet]` Scaffold frontend + struktur folder
- **PRD:** §10.1, §11, §17.5 (base path).
- **Isi:** Svelte 5 + Vite + TS strict di `frontend/`; folder sesuai §11 (placeholder `.gitkeep`); `brand.config.ts`; `styles/tokens.css` & `base.css` minimal; i18n stub `id.json`/`en.json`; halaman hello-world (teks lewat i18n, warna lewat token); `vite.config.ts` membaca `VITE_BASE`.
- **AC:** `npm run build` sukses; build dengan `VITE_BASE=/studykidsapp/` menghasilkan path aset benar; tampil rapi di 360 px.

### T0.5 `[sonnet]` Tooling frontend + `npm run check`
- **PRD:** §10.1 (lint/format), §8.1, §15.1–15.2.
- **Isi:** ESLint + Prettier + svelte-check; Vitest + 1 unit test contoh; `scripts/check-bundle-size.mjs` (JS awal ≤ 120 KB gzip, CSS ≤ 25 KB gzip); `npm run check` = lint + typecheck + unit test + bundle size; larangan `console.log` via lint.
- **AC:** `npm run check` hijau; sengaja langgar budget → script gagal (bukti di PR).

### T0.6 `[sonnet]` Playwright + axe-core
- **PRD:** §15.1.
- **Isi:** Playwright project Pixel 5, iPhone 12, desktop; 1 smoke test hello-world; cek axe 0 pelanggaran serius; `npm run test:e2e`.
- **AC:** `npm run test:e2e` lolos lokal.

### T0.7 `[opus]` Scaffold backend Slim 4 + tooling PHP
- **PRD:** §10.1, §11 (backend/), §8.3.
- **Isi:** `backend/composer.json`, `public/index.php`, struktur `src/` §11; load `.env`; factory PDO (prepared statements, error mode exception, utf8mb4); endpoint `GET /api/health` → `{status, db}`; error handler JSON tanpa bocor detail; PHPUnit (test health dengan & tanpa DB), PHPStan level 6, PHP-CS-Fixer; `composer test` & `composer lint`. Kode kompatibel PHP 8.2.
- **AC:** `composer test` & `composer lint` hijau; `php -S localhost:8000 -t backend/public` → `/api/health` mengembalikan `db: ok` saat MySQL hidup.

### T0.8 `[opus]` Phinx + `npm run db:reset`
- **PRD:** §10.1, §12 (hanya konfigurasi — skema tabel dibuat di Fase 4), §17.1.
- **Isi:** `phinx.php` membaca `.env` (env `development` & `testing`); folder `db/migrations` & `db/seeds` (kosong / 1 migrasi `settings` minimal? → diputuskan architect, default: kosong); script `db:reset` (drop + create + migrate + seed) hanya untuk `studykids_dev`/`studykids_test`, menolak berjalan di env lain.
- **AC:** `npm run db:reset` sukses di laptop Bimo; menolak jika `DB_NAME` bukan dev/test.

### T0.9 `[sonnet]` `npm run dev` (Vite + PHP sekaligus)
- **PRD:** §17.1.
- **Isi:** `concurrently` menjalankan Vite :5173 + `php -S localhost:8000 -t backend/public`; proxy `/api` → :8000; hello-world menampilkan status API/DB bila `VITE_API_MODE` bukan `local`.
- **AC (E2):** `npm run dev` → buka `localhost:5173` di 360 px, terlihat "API ok, DB ok" (screenshot tanpa data anak di PR).

### T0.10 `[sonnet]` CI GitHub Actions + Dependabot
- **PRD:** §11 (`ci.yml`), §15.1, §17.3, §17.5.
- **Isi:** `.github/workflows/ci.yml` (job frontend: install, `npm run check`, build, Playwright; job backend: PHP 8.2 & 8.4 matrix, service MySQL, `composer lint` + `composer test`); Lighthouse CI terhadap build (assert performance ≥ 90); `.github/dependabot.yml` (npm, composer, github-actions, mingguan).
- **AC (E1):** CI hijau di PR ini; tautan run dicatat di PROGRESS.

### T0.11 `[sonnet]` Deploy GitHub Pages
- **PRD:** §17.1 (Preview), §17.5 (Pages, base path).
- **Isi:** `.github/workflows/deploy-pages.yml` (push ke `main` → build `VITE_BASE=/studykidsapp/`, `VITE_API_MODE=local` → deploy).
- **AC (E3):** `https://medirty.github.io/studykidsapp/` menampilkan hello-world tanpa 404 aset.

### T0.12 `[sonnet]` Verifikasi tooling Claude + persiapan gate
- **PRD:** §16.2, §16.4.
- **Isi:** cek plugin/MCP yang sudah dipasang Bimo (B7), catat di PROGRESS; pastikan `CLAUDE_CODE_SUBAGENT_MODEL` tidak di-set; rangkum bukti E1–E4.
- **AC:** semua bukti Exit Criteria tercatat; siap `/gate`.

### Gate `[opus]` — `/gate` oleh subagent `reviewer`, lalu Bimo menulis "Fase 0 disetujui" → tag `phase-0-approved`.

## Tindakan manual Bimo (tidak bisa/boleh dikerjakan Claude)

| # | Tindakan | Kapan | Rujukan |
|---|---|---|---|
| B1 | Beli domain `studykids.id` (registrar mana saja; DNS diarahkan nanti di Fase 4) | Secepatnya (sebelum diambil orang) | §14, §17.2 |
| B2 | Install PHP 8.4 bersih ke `C:\php-8.4` + aktifkan ekstensi + atur PATH | Sebelum T0.7 | §17.1, `SETUP_LOCAL.md` (T0.1) |
| B3 | Tambah `C:\xampp\mysql\bin` ke PATH; start MySQL di XAMPP | Sebelum T0.7 | §17.1 |
| B4 | Buat user MySQL `studykids` + DB `studykids_dev` & `studykids_test`; isi `backend/.env` (password hanya di laptop) | Sebelum T0.8 | §17.1 |
| B5 | GitHub → Settings → Code security: aktifkan **Secret scanning** & **Push protection** | Sekarang | §17.5 |
| B6 | GitHub → Settings → Pages → Source: **GitHub Actions** | Sebelum T0.11 | §17.5 |
| B7 | Install plugin/MCP §16.4 yang belum ada: find-skills, skill refactor, Context7, Chrome DevTools MCP; (opsional) claude-mem | Kapan saja di Fase 0 | §16.4 |
| B8 | Proteksi branch `main` (wajib PR + CI hijau, tanpa force push) | Setelah T0.10 (supaya nama check CI ada) | §17.5 |
| B9 | Review & merge PR tiap task | Tiap task | §17.5 |
