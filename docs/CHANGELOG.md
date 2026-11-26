# CHANGELOG

Format mengikuti [Keep a Changelog](https://keepachangelog.com/). Versi memakai semver. Bug yang diperbaiki wajib dicatat di sini.

## [Belum dirilis]

### Ditambahkan
- Tooling bootstrap, `scripts/doctor.mjs`, dan `docs/SETUP_LOCAL.md` (T0.0, T0.1).
- Kerangka dokumen proyek: README, DECISIONS, CHANGELOG, CHANGE_REQUESTS, ASSET_LICENSES, `.env.example` (T0.2).
- Backend Slim 4 + PDO: `GET /api/health` (`{status, db}`), error handler JSON tanpa detail, PHPUnit/PHPStan level 6/PHP-CS-Fixer, `composer test|lint`, `npm run test:api|lint:api` via `scripts/run-php.mjs` (T0.7).
- Phinx (`backend/phinx.php`, env `development`/`testing`), migrasi awal tabel `settings` + seed default §4.2, `npm run db:migrate`, `npm run db:reset [-- --test]` dengan pengaman env (APP_ENV local/testing + DB `*_dev`/`*_test`) (T0.8).

- CI GitHub Actions (frontend, Lighthouse, backend PHP 8.2/8.4 + MySQL 8) dan Dependabot mingguan (T0.10).

### Diperbaiki
- Migrasi `settings`: kolom `key` NOT NULL agar jalan di MySQL 8 (sebelumnya hanya lolos di MariaDB) (T0.10).
- Bahasa pilihan tidak lagi kembali ke Indonesia bila halaman di-reload sebelum penyimpanan Dexie selesai: `SettingsStore.load()` kini memakai pilihan di localStorage (ditulis sinkron) dan hanya jatuh ke Dexie bila localStorage kosong. Regresi T3.1 (L-8, UI dulu); membuat E2E `profile.spec.ts` bahasa gagal acak di CI (main merah sejak #81).

### Diubah
- PRD v1.7: aturan subagent dan auto-merge PR (CR-001).
