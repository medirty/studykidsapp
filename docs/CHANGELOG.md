# CHANGELOG

Format mengikuti [Keep a Changelog](https://keepachangelog.com/). Versi memakai semver. Bug yang diperbaiki wajib dicatat di sini.

## [Belum dirilis]

### Ditambahkan
- Tooling bootstrap, `scripts/doctor.mjs`, dan `docs/SETUP_LOCAL.md` (T0.0, T0.1).
- Kerangka dokumen proyek: README, DECISIONS, CHANGELOG, CHANGE_REQUESTS, ASSET_LICENSES, `.env.example` (T0.2).
- Backend Slim 4 + PDO: `GET /api/health` (`{status, db}`), error handler JSON tanpa detail, PHPUnit/PHPStan level 6/PHP-CS-Fixer, `composer test|lint`, `npm run test:api|lint:api` via `scripts/run-php.mjs` (T0.7).

### Diubah
- PRD v1.7: aturan subagent dan auto-merge PR (CR-001).
