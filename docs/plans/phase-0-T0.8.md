# T0.8 — Phinx + `npm run db:reset` dengan pengaman env (rencana)

PRD §10.1 (Phinx), §11 (`backend/db/migrations`, `backend/db/seeds`), §12.1 (`settings`), §17.1. Acuan: D-002 (`db:migrate`, `db:reset`, composer `migrate`), D-003 (pengaman), D-006 (`robmorgan/phinx ^0.16`).

## Desain

- `composer require robmorgan/phinx:^0.16` (sudah di D-006, tanpa dependency baru di luar ADR).
- `backend/phinx.php`: load `backend/.env` (phpdotenv immutable → env asli menang, sama seperti `public/index.php`), `$_ENV + getenv()`. Environment `development` (`DB_NAME`) & `testing` (`DB_TEST_NAME`), adapter mysql utf8mb4. Path `db/migrations`, `db/seeds`.
- **Migrasi awal: tabel `settings` (key, value_json)** persis PRD §12.1. Alasan: satu-satunya tabel yang dibutuhkan lintas fase (harga §4.2, batas demo §5.1), tidak mengarang kolom, dan diperlukan agar `db:reset` teruji end-to-end (rollback + migrate + seed). Tabel domain lain tetap Fase 4.
- **Seed `SettingsSeeder`:** 5 kunci yang disebut namanya di PRD §4.2 (`price_early`, `price_normal`, `early_quota`, `pending_ttl_minutes`, `min_price`). Hanya data dev/test; produksi diisi lewat admin/migrasi data nanti.
- `scripts/lib/db-guard.mjs` → `resetTarget(env, { test })`: tolak kecuali `APP_ENV` ∈ {`local`,`testing`} **dan** nama DB cocok `^\w+_(dev|test)$` (D-003). Mengembalikan `{ phinxEnv, dbVar, db }` atau `{ error }` (pesan jelas). Test `node --test` (TDD).
- `scripts/db-reset.mjs`: env = `backend/.env` ditimpa `process.env` (urutan sama dengan phpdotenv immutable) → guard → jalankan `phinx rollback -t 0`, `migrate`, `seed:run` dengan PHP_BIN. Nilai yang sudah dicek (`APP_ENV`, nama DB) dikirim eksplisit ke env proses anak, jadi Phinx memakai persis nilai yang lolos guard. `--test` → env `testing` / `DB_TEST_NAME`.
- Script: root `db:migrate`, `db:reset`; composer `migrate` (D-002). Phinx config ikut PHPStan & CS-Fixer.

## Di luar scope
Drop/create database (ADR memilih rollback semua), tabel domain (Fase 4), reset otomatis DB test per test run (T0.10 / Fase 4).
