# DECISIONS — Log Keputusan

Format ADR singkat. Tambahkan entri baru di paling bawah. Setiap dependency baru wajib dicatat di sini (alasan, lisensi, ukuran). Saran refactor besar di luar task juga ditulis di sini.

## Template

```
## D-NNN — Judul (tanggal)
- **Status:** diusulkan | disetujui | digantikan oleh D-XXX
- **Konteks:** kenapa keputusan ini perlu
- **Keputusan:** apa yang dipilih
- **Alternatif:** yang dipertimbangkan
- **Konsekuensi:** dampak, lisensi, ukuran (untuk dependency)
```

## Entri

D-001 s.d. D-007 dibuat di T0.3 (22 Nov 2026) sebagai acuan T0.4–T0.11. Rencana: [plans/phase-0-T0.3.md](plans/phase-0-T0.3.md). Versi & lisensi dicek dari registry npm dan Packagist pada 22 Nov 2026 (tanpa instalasi).

## D-001 — Layout repo & npm workspaces (22 Nov 2026)
- **Status:** disetujui
- **Konteks:** PRD §11 menetapkan `frontend/`, `backend/`, `scripts/`, `docs/` di satu repo. Perlu diputuskan di mana `package.json`, lockfile, dan `.env` frontend berada, supaya `npm run dev` bisa dijalankan dari root (§17.1).
- **Keputusan:**
  - Folder persis mengikuti PRD §11. Tidak ada folder tingkat atas tambahan.
  - **npm workspaces**: `package.json` root (privat, `"workspaces": ["frontend"]`) berisi script orkestrasi + `concurrently`. `frontend/package.json` berisi dependency & script frontend. Satu lockfile `package-lock.json` di root; `node_modules/` di-hoist ke root.
  - Backend dikelola Composer sendiri: `backend/composer.json`, `backend/composer.lock`, `backend/vendor/`. Tidak masuk workspaces npm.
  - `.env` frontend tetap di **root** (sesuai §11). `frontend/vite.config.ts` memakai `envDir: '..'`.
  - Admin = entry Vite kedua (`frontend/admin/`, multi-page `build.rollupOptions.input`), bukan package terpisah.
  - Script Node lintas-bagian (`check-bundle-size`, `run-php`, `db-reset`, `doctor`) di `scripts/`, tanpa dependency (hanya modul bawaan Node), helper murni di `scripts/lib/` dengan test `node --test`.
- **Alternatif:** (a) tanpa workspaces, `cd frontend && npm i` terpisah: dua lockfile & dua `npm install`, lebih mudah lupa. (b) pnpm/yarn: tambah tool baru tanpa manfaat berarti.
- **Konsekuensi:** satu `npm install` di root cukup. CI memakai `npm ci` di root. Perintah frontend dari root: `npm run <script> -w frontend`.

## D-002 — Kontrak script npm & Composer (22 Nov 2026)
- **Status:** disetujui
- **Konteks:** CLAUDE.md dan PRD §15/§17.1 merujuk `npm run dev|build|check|test:e2e|db:reset` dan `composer test|lint`. Nama ini harus tetap, isinya diimplementasi bertahap di T0.4–T0.10. PHP lokal harus `PHP_BIN` (8.4), bukan `php` di PATH (XAMPP 8.2).
- **Keputusan:**

  **Root `package.json`** (dijalankan dari root):

  | Script | Isi | Task |
  |---|---|---|
  | `dev` | `concurrently -k -n web,api "npm:dev:web" "npm:dev:api"` | T0.9 |
  | `dev:web` | `npm run dev -w frontend` (Vite :5173, proxy `/api` → :8000) | T0.9 |
  | `dev:api` | `node scripts/run-php.mjs -S localhost:8000 -t backend/public` | T0.9 |
  | `build` | `npm run build -w frontend` | T0.4 |
  | `check` | `npm run check -w frontend` | T0.5 |
  | `test:e2e` | `npm run test:e2e -w frontend` | T0.6 |
  | `test:api` | `node scripts/run-php.mjs backend/vendor/bin/phpunit -c backend/phpunit.xml.dist` | T0.7 |
  | `lint:api` | PHPStan + PHP-CS-Fixer (dry-run) lewat `run-php.mjs` | T0.7 |
  | `db:migrate` | Phinx `migrate` lewat `run-php.mjs` | T0.8 |
  | `db:reset` | `node scripts/db-reset.mjs` → rollback semua + migrate + seed, dengan pengaman env (D-003) | T0.8 |
  | `doctor` | `node scripts/doctor.mjs` | T0.4 (script sudah ada) |
  | `format` | `npm run format -w frontend` | T0.5 |

  **`frontend/package.json`:**

  | Script | Isi |
  |---|---|
  | `dev` / `build` / `preview` | `vite` / `vite build` / `vite preview` |
  | `lint` | `eslint . && prettier --check .` |
  | `format` | `prettier --write .` |
  | `typecheck` | `svelte-check --tsconfig ./tsconfig.json --fail-on-warnings` |
  | `test` | `vitest run` |
  | `size` | `node ../scripts/check-bundle-size.mjs dist` |
  | `check` | `lint` → `typecheck` → `test` → `build` → `size` (berhenti di langkah pertama yang gagal) |
  | `test:e2e` | `playwright test` |

  **`backend/composer.json` scripts:** `test` (`@php vendor/bin/phpunit`), `lint` (`@php vendor/bin/phpstan analyse` + `@php vendor/bin/php-cs-fixer check`), `fix` (`php-cs-fixer fix`), `migrate` (`phinx migrate`).

  **`scripts/run-php.mjs`** (T0.7, tanpa dependency): baca `PHP_BIN` dari `backend/.env` (pakai `parseEnv` di `scripts/lib/doctor-utils.mjs`), fallback `php` bila kosong (CI/server), teruskan argumen & exit code.
- **Alternatif:** memanggil `composer test` di lokal: Composer berjalan dengan PHP tempat ia di-install (kemungkinan XAMPP 8.2), jadi tidak menjamin 8.4. `cross-env` untuk set env di script: tidak perlu karena env build diset di workflow CI (D-003).
- **Konsekuensi:** di lokal pakai `npm run test:api` / `lint:api` (pasti PHP 8.4). `composer test` / `composer lint` tetap valid dan dipakai CI (matrix PHP 8.2 & 8.4). Nama script di atas adalah kontrak: mengganti nama = ADR baru.

## D-003 — Kontrak variabel env (22 Nov 2026)
- **Status:** disetujui
- **Konteks:** PRD §10.2 (mode lokal), §17.1 (`backend/.env`), §17.5 (`VITE_BASE`, GitHub Secrets, repo public). Env frontend ikut masuk bundle → publik; env backend berisi rahasia.
- **Keputusan:**

  **Frontend — `.env` di root** (template `.env.example`; semua nilai publik, dibaca saat build):

  | Variabel | Nilai | Default | Dipakai di |
  |---|---|---|---|
  | `VITE_BASE` | `/` (lokal, produksi, staging) · `/studykidsapp/` (GitHub Pages) | `/` | `vite.config.ts` `base`, scope & `start_url` PWA, router |
  | `VITE_API_MODE` | `local` (IndexedDB, tanpa backend) · `api` (REST ke backend) | `local` | `services/api.ts` memilih adapter |

  - URL API **tidak** dijadikan env: `services/api.ts` memakai `` `${import.meta.env.BASE_URL}api/` `` (relatif terhadap base, tidak hardcode `/`). Lokal di-proxy Vite ke `localhost:8000`; produksi/staging = `public_html/api/` (§10.2).
  - Nama mode `api` mengikuti `.env.example` dari T0.2 (menggantikan "remote" di rencana fase).
  - Build Pages: workflow `deploy-pages.yml` men-set `VITE_BASE=/studykidsapp/` dan `VITE_API_MODE=local` di blok `env:` (bukan file `.env` yang di-commit).
  - Port dev (5173, 8000) adalah konstanta di config, bukan env.
  - Dilarang menaruh rahasia apa pun di variabel `VITE_*`.

  **Backend — `backend/.env`** (template `backend/.env.example`; di-ignore Git; di server berada di luar `public_html`; dimuat `vlucas/phpdotenv`):

  | Variabel | Isi | Ada sejak |
  |---|---|---|
  | `APP_ENV` | `local` · `testing` · `staging` · `production` (mengatur mode debug & pengaman `db:reset`) | ditambahkan ke `.env.example` di T0.7 |
  | `PHP_BIN` | path PHP 8.4 lokal; kosong di CI/server → `php` | T0.2 |
  | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_TEST_NAME`, `DB_USER`, `DB_PASS` | koneksi MySQL/MariaDB; `DB_PASS` hanya diisi di `.env` asli | T0.2 |
  | `SMTP_*` | email PHPMailer | Fase 4 (nama pasti ditentukan saat itu) |
  | `MIDTRANS_*` | kunci gateway, hanya di `.env` server | Fase 6 |

  - Test PHPUnit memakai `DB_TEST_NAME`, tidak pernah `DB_NAME`.
  - **Pengaman `db:reset`:** menolak jalan kecuali `APP_ENV` ∈ {`local`, `testing`} **dan** nama DB berakhiran `_dev` atau `_test`.

  **GitHub Secrets** (bukan file env, §17.5): `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`, `DEPLOY_METHOD`, `DEPLOY_SSH_KEY`/`DEPLOY_FTP_PASSWORD` (Fase 4).
- **Alternatif:** `VITE_API_URL` sebagai env: tidak perlu karena API selalu di `<base>api/`; menambah peluang salah konfigurasi.
- **Konsekuensi:** menambah variabel env = update `.env.example` terkait + tabel ini di PR yang sama.

## D-004 — Versi runtime: Node, PHP, TypeScript (22 Nov 2026)
- **Status:** diusulkan — butuh tindakan Bimo (upgrade Node, lihat B9 di `PROGRESS.md`) sebelum T0.5
- **Konteks:** Laptop memakai Node 22.12.0 (doctor mensyaratkan ≥ 22.12). Versi stabil terbaru beberapa tool mensyaratkan lebih: ESLint 10 & `@eslint/js` 10 → Node ≥ 22.13; `@lhci/cli` 0.16 → ≥ 22.19; `jsdom` 31 → ≥ 22.22. Vite 8, Vitest 5, `@axe-core/playwright` 4.14 → ≥ 22.12. Node 22 berakhir dukungan April 2027 (sekitar waktu launch); Node 24 adalah LTS aktif.
- **Keputusan:**
  - **Node 24 LTS** untuk lokal & CI (`engines.node: ">=22.22"` di root `package.json`, `.nvmrc`/`node-version: 24` di CI). Doctor dinaikkan ke ≥ 22.22 di T0.4.
  - **PHP:** dev & produksi 8.4, kode kompatibel 8.2 (PRD §10.1). `backend/composer.json` memakai `"config": {"platform": {"php": "8.2.0"}}` agar lockfile hanya berisi paket yang jalan di 8.2; CI menguji 8.2 & 8.4.
  - **TypeScript `~6.0`**, bukan 7.0: `svelte-check` 4.7 hanya mendukung TS `^5 || ^6` dan `typescript-eslint` 8.73 mendukung `<6.1`. Naik ke TS 7 setelah kedua tool mendukung (Dependabot).
- **Alternatif:** tetap Node 22.12 dengan ESLint 9 + jsdom lama: jalan, tapi mengunci versi lama dan Node 22 habis dukungan dekat launch.
- **Konsekuensi:** Bimo perlu upgrade Node (`winget upgrade OpenJS.NodeJS.LTS` atau installer Node 24 LTS) — instalasi butuh izin Bimo. Jika ditunda, T0.5 memakai ESLint 9 sebagai fallback dan dicatat di ADR baru.

## D-005 — Dependency frontend + lisensi (22 Nov 2026)
- **Status:** disetujui (hanya yang tertulis; dependency lain wajib ADR baru)
- **Konteks:** Stack final PRD §10.1; budget JS awal ≤ 120 KB gzip (§8.1). Semua lisensi harus permisif untuk produk komersial closed-source.
- **Keputusan:** versi = mayor terbaru stabil per 22 Nov 2026, dipasang dengan `^` (TypeScript `~`); versi persis dikunci di lockfile.

  **Runtime (masuk bundle)** — ukuran gzip adalah perkiraan, angka pasti diukur `check-bundle-size`:

  | Paket | Versi | Lisensi | Ukuran gzip (perk.) | Dimuat | Alasan | Dipasang |
  |---|---|---|---|---|---|---|
  | `svelte` | ^5.59 | MIT | ~5–15 KB runtime | awal | framework UI, bundle kecil | T0.4 |
  | `svelte-spa-router` | ^5.1 | MIT | ~3 KB | awal | routing hash, jalan di Pages & hosting statis; peer `svelte ^5` | Fase 2 |
  | `dexie` | ^4.4 | Apache-2.0 | ~30 KB | awal atau lazy setelah render pertama | IndexedDB untuk progress offline & antrian | Fase 2/3 |
  | `workbox-window` (via `vite-plugin-pwa`) | ^7.4 | MIT | ~2 KB | awal | registrasi service worker | Fase 2 |
  | `uplot` | ^1.6 | MIT | ~20 KB | **lazy** (laporan ortu & admin) | grafik ringan | Fase 4/5 |
  | `canvas-confetti` | ^1.9 | ISC | ~5 KB | **lazy** | efek perayaan | Fase 3 |

  Perkiraan JS awal = Svelte + router + Dexie + workbox-window + kode app ≈ 40–50 KB + kode app, aman di bawah 120 KB. Bila mepet, `db.ts` (Dexie) di-import dinamis.

  **Dev (tidak masuk bundle):**

  | Paket | Versi | Lisensi | Alasan | Dipasang |
  |---|---|---|---|---|
  | `vite` | ^8.3 | MIT | bundler/dev server | T0.4 |
  | `@sveltejs/vite-plugin-svelte` | ^7.3 | MIT | plugin Svelte untuk Vite 8 | T0.4 |
  | `typescript` | ~6.0 | Apache-2.0 | TS strict (lihat D-004) | T0.4 |
  | `vite-plugin-pwa` | ^2.0 | MIT | manifest + service worker Workbox | Fase 2 |
  | `svelte-check` | ^4.7 | MIT | typecheck `.svelte` | T0.5 |
  | `eslint`, `@eslint/js` | ^10 | MIT | lint (aturan `no-console`) | T0.5 |
  | `typescript-eslint` | ^8.73 | MIT | lint TS | T0.5 |
  | `eslint-plugin-svelte` | ^3.24 | MIT | lint Svelte | T0.5 |
  | `eslint-config-prettier` | ^10.1 | MIT | matikan aturan yang bentrok dengan Prettier | T0.5 |
  | `globals` | ^17 | MIT | daftar global browser/node untuk flat config | T0.5 |
  | `prettier`, `prettier-plugin-svelte` | ^3.10, ^4.2 | MIT | format | T0.5 |
  | `vitest` | ^5.1 | MIT | unit test (environment `node` untuk engine) | T0.5 |
  | `@playwright/test` | ^1.65 | Apache-2.0 | E2E Pixel 5, iPhone 12, desktop | T0.6 |
  | `@axe-core/playwright` | ^4.14 | MPL-2.0 | cek aksesibilitas di E2E. MPL hanya copyleft per-file bila file-nya dimodifikasi; dipakai apa adanya sebagai alat test, tidak didistribusikan → aman | T0.6 |
  | `concurrently` (root) | ^10.0 | MIT | jalankan Vite + `php -S` bersamaan (§17.1) | T0.9 |

  **Tidak dipasang sebagai dependency:**
  - Lighthouse CI: dijalankan di CI dengan `npx @lhci/cli@0.16.x` (Apache-2.0, butuh Node ≥ 22.19) agar tidak membengkakkan lockfile. T0.10.
  - DOM test environment (`happy-dom` MIT atau `jsdom` MIT) dan `@testing-library/svelte` (MIT): ditunda sampai ada test komponen pertama; dicatat di ADR saat itu.
  - `@types/node`, `@tsconfig/svelte`, `cross-env`: tidak perlu untuk Fase 0.
- **Alternatif:** framework CSS (Tailwind dsb.) — ditolak PRD §10.1. Router lain (`svelte-routing`, SvelteKit) — SvelteKit terlalu berat untuk SPA statis + PHP.
- **Konsekuensi:** semua lisensi runtime permisif (MIT/ISC/Apache-2.0) → tidak ada kewajiban membuka kode. Apache-2.0 (Dexie): sertakan pemberitahuan lisensi pihak ketiga di build (komentar lisensi dipertahankan bundler) — dicek saat Fase 7.

## D-006 — Dependency backend + lisensi (22 Nov 2026)
- **Status:** disetujui (hanya yang tertulis)
- **Konteks:** PRD §10.1 (Slim 4, PDO, Phinx, PHPMailer, PHPUnit, PHPStan level 6, PHP-CS-Fixer). Kode harus jalan di PHP 8.2 (D-004). Shared hosting: `vendor/` di luar `public_html`, deploy dengan `composer install --no-dev`.
- **Keputusan:**

  **Runtime (`require`):**

  | Paket | Versi | Lisensi | Syarat PHP | Alasan | Dipasang |
  |---|---|---|---|---|---|
  | `php` + `ext-pdo`, `ext-pdo_mysql`, `ext-mbstring`, `ext-json` | ^8.2 | — | — | runtime + driver DB (PDO bawaan, bukan paket) | T0.7 |
  | `slim/slim` | ^4.15 | MIT | 8.2–8.6 | micro-framework REST | T0.7 |
  | `slim/psr7` | ^1.8 | MIT | ^8.0 | implementasi PSR-7 resmi Slim | T0.7 |
  | `php-di/php-di` | ^7.1 | MIT | ≥ 8.0 | container PSR-11 dengan autowiring → controller/service/repository bisa disuntik tanpa wiring manual | T0.7 |
  | `vlucas/phpdotenv` | ^5.8 | BSD-3-Clause | ^8.0 | membaca `backend/.env` (shared hosting tidak menyediakan env var) | T0.7 |
  | `robmorgan/phinx` | ^0.16 | MIT | 64-bit ≥ 8.1 | migrasi & seed (§17.1). Membawa `cakephp/database` (MIT) | T0.8 |
  | `phpmailer/phpmailer` | ^7.2 | LGPL-2.1 | ≥ 5.5 | kirim email SMTP hosting. LGPL: dipakai sebagai library tanpa modifikasi → aman untuk kode closed-source | Fase 4 |

  **Dev (`require-dev`):**

  | Paket | Versi | Lisensi | Alasan | Dipasang |
  |---|---|---|---|---|
  | `phpunit/phpunit` | ^11.5 | BSD-3-Clause | unit/integration test. **Bukan 12/13**: PHPUnit 12 butuh PHP 8.3, 13 butuh 8.5 | T0.7 |
  | `phpstan/phpstan` | ^2.3 | MIT | static analysis level 6 | T0.7 |
  | `friendsofphp/php-cs-fixer` | ^3.95 | MIT | format (PER-CS) | T0.7 |

- **Alternatif:** tanpa container (closure route saja): wiring manual makin rumit di Fase 4. `illuminate/database`/Doctrine: berat, PRD minta PDO langsung. Symfony Mailer: lebih besar dari PHPMailer.
- **Konsekuensi:** `vendor/` produksi kecil (tanpa dev). Pembayaran (Midtrans) tidak memakai SDK di Fase 0; diputuskan di Fase 6 dengan ADR baru.

## D-007 — Cara cek performance budget (22 Nov 2026)
- **Status:** disetujui
- **Konteks:** PRD §8.1 mewajibkan budget dicek di CI: JS awal ≤ 120 KB gzip, CSS awal ≤ 25 KB, per chunk mini game ≤ 60 KB, per JSON unit ≤ 15 KB, gambar ≤ 50 KB; Lighthouse mobile ≥ 90.
- **Keputusan:**
  - `scripts/check-bundle-size.mjs` (T0.5, tanpa dependency, `node:zlib` `gzipSync`). Vite diset `build.manifest: true`; script membaca `dist/.vite/manifest.json`:
    - **JS awal** = chunk entry `index.html` + semua `imports` statisnya (rekursif). `dynamicImports` tidak dihitung.
    - **CSS awal** = `css` milik chunk-chunk awal tersebut.
    - Entry admin dihitung terpisah (tidak masuk budget app anak).
    - Chunk dari `src/games/**` ≤ 60 KB masing-masing; `src/content/**/*.json` ≤ 15 KB; gambar di `dist` ≤ 50 KB. Aturan ini aktif begitu file jenis itu ada (Fase 2/3), angka diambil dari satu objek konfigurasi di script.
    - Cetak tabel ukuran; exit code 1 bila ada yang melewati batas.
  - Logika hitung (parse manifest, kumpulkan chunk awal, bandingkan budget) di `scripts/lib/` sebagai fungsi murni dengan test `node --test` (TDD).
  - Lighthouse CI di `ci.yml` (T0.10) dengan preset mobile, assert `categories:performance ≥ 0.9`, LCP < 2500 ms, CLS < 0.1.
- **Alternatif:** `size-limit`/`bundlesize`: dependency tambahan dan tidak paham pembagian awal vs lazy dari manifest Vite.
- **Konsekuensi:** `npm run check` gagal bila budget dilanggar; T0.5 wajib membuktikan dengan pelanggaran sengaja.

## D-008 — Skill tambahan ponytail & security-review (CR-003, 23 Nov 2026)
- **Status:** disetujui (CR-003, Bimo)
- **Konteks:** PRD v1.9 §16.4.1. Sebelum dipasang, `SKILL.md`, hook, dan script dibaca; tidak ada panggilan jaringan (kecuali webhook opsional ponytail, kosong secara default), tidak ada penghapusan file di luar bendera/tmp milik plugin.
- **Keputusan:**
  - **ponytail** `5.3.3`, MIT, repo `DietrichGebert/ponytail`, commit `ebd8654c2c627f721eb8f9c0d1bd4090a29f9e10`. Plugin scope project (`ponytail@ponytail`), marketplace dideklarasikan di `.claude/settings.json` → `extraKnownMarketplaces`. Auto-update **tidak** diaktifkan; update hanya lewat CR/PR. Nama skill di Claude Code: `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help` (nama di field `skills:` agent diverifikasi di sesi baru).
  - **security-review** dari ECC (MIT), commit `4adeee6732a12d1540f49a4d50a38ce8c97f9a53`, hanya folder `skills/security-review` (`SKILL.md`, `cloud-infrastructure-security.md`) disalin ke `.claude/skills/security-review/`. Tanpa hooks/rules/agents/memory/installer.
- **Efek samping ponytail yang diketahui:** (1) 3 hook (SessionStart, SubagentStart, UserPromptSubmit) menambah aturan + peta kode (maks 2000 karakter) ke konteks tiap sesi; (2) menulis di luar project: `~/.claude/.ponytail-active`, salinan script statusline di `~/.claude`, catatan biaya/token per giliran di `~/.config/ponytail/band/*.csv` (lokal); (3) menyarankan edit `settings.json` global untuk statusline: **ditolak**, tidak diubah. Bisa dimatikan: `PONYTAIL_MAP=0` (peta kode), `/ponytail band off`, `/ponytail off`.
- **Catatan security-review:** contoh kode untuk Next.js/Supabase/Solana, bukan PHP/Slim/PDO. Di task auth/pembayaran, padukan dengan checklist keamanan PRD §15 (PDO prepared statements, CSRF Slim, anti-IDOR).
- **Alternatif:** ECC paket penuh (ditolak, lihat PRD §16.4); graphify (ditunda ke awal Fase 4, §16.4.2).
- **Konsekuensi:** `scripts/doctor.mjs` mengecek ponytail aktif + `.claude/skills/security-review/SKILL.md`.

## D-009 — MariaDB 11.8 lokal & koneksi DB tahan-beda-server (CR-004, 23 Nov 2026)
- **Status:** disetujui (CR-004, Bimo)
- **Keputusan:** MariaDB **11.8.2** dipasang lewat `winget` (MSI, service `MariaDB`, Running + Automatic) di `C:\Program Files\MariaDB 11.8` (path sesuai rencana, tidak berbeda). Password root acak di `%USERPROFILE%\.studykids\mariadb-root.txt` (ACL hanya user Windows), di luar repo. `scripts/db-setup.ps1` membuat DB dev/test + user `studykids`. `Database::pdo()` mengeset `sql_mode` ketat, `time_zone='+00:00'`, `utf8mb4_unicode_ci` (test: `DatabaseSessionTest`). CI memakai `mariadb:11.8`. Nama job CI tidak diubah.
- **Catatan:** user `studykids` dibuat untuk `'localhost'` saja; koneksi `127.0.0.1` tetap diterima MariaDB (diverifikasi doctor). XAMPP tidak di-uninstall (rollback: start MySQL XAMPP + kembalikan `backend/.env`).

## D-010 — Skill impeccable menggantikan frontend-design (CR-005, 24 Nov 2026)
- **Status:** disetujui (CR-005, Bimo)
- **Keputusan:** `npx impeccable install --providers=claude --scope=project -y` (impeccable skill `4.10.0`, engine `v0.1.27`, Apache-2.0). Plugin `frontend-design` di-uninstall dan dihapus dari `enabledPlugins`; `doctor` tidak lagi memintanya, tetapi mengecek `.claude/skills/impeccable/SKILL.md`.
- **Penyimpangan dari installer:** installer menambah 5 subagent `impeccable-*` di `.claude/agents/`. Dihapus karena PRD §16.2 hanya mengizinkan 4 subagent (maks 1 bersamaan). Skill punya jalur tanpa subagent.
- **Efek samping yang diketahui:** (1) engine biner diunduh ke `~/.impeccable/bin/` (di luar project); (2) hook SessionStart/PostToolUse/Stop ditulis ke `.claude/settings.local.json` (git-ignored, hanya laptop ini) dan memindai file UI setelah Edit/Write; (3) skill menulis `PRODUCT.md`, `DESIGN.md`, `.impeccable/` saat `/impeccable init` / `document`; (4) mode `live` dan Apply menjalankan CLI `claude`/`codex` dengan izin dilewati: **jangan dipakai** (set `IMPECCABLE_LIVE_COPY_AGENT=off`). Hook tidak dipakai di CI.
- **Aturan pakai:** impeccable tidak boleh menang atas PRD §8.5/§9, `tokens.css`, i18n, dan brand (PRD yang berlaku). Hasil desain tetap lewat persetujuan Bimo (§17.5).
- **Belum dikerjakan:** `/impeccable init` (menulis `PRODUCT.md`) dijalankan di awal Fase 1, bersama Bimo.

## D-011 — Arsitektur frontend Fase 2: route, store, Dexie, api.ts, ikon, DOM test env (T2.0, 26 Nov 2026)
- **Status:** diusulkan (T2.0; berlaku setelah PR di-review)
- **Konteks:** Fase 2 membangun fondasi FE ([plans/phase-2.md](plans/phase-2.md), rencana task [plans/phase-2-T2.0.md](plans/phase-2-T2.0.md)). Acuan: PRD §8.1 (JS awal ≤ 120 KB gzip; saat ini **16,81 KB**), §8.4 (privasi anak), §10.1–10.2 (mode `local`), §11, §12.2, FR-2, FR-3; D-003, D-004, D-005, D-007. Tipe data: [`frontend/src/services/types.ts`](../frontend/src/services/types.ts).
- **Keputusan:**

  **(a) Route — `svelte-spa-router` mode hash (`#/…`).**

  | Route | Layar | Muat | Dibangun |
  |---|---|---|---|
  | `/` | Landing | awal | T2.10 |
  | `/start` | Pilih kelas / profil | awal | T2.11 |
  | `/home` | Beranda | awal | T2.11 |
  | `*` | 404 ramah | awal | T2.5 |
  | `/subject/:subjectId` | Peta belajar | lazy | Fase 3 |
  | `/session/:skillId` | Sesi: soal → feedback → ringkasan (state di dalam route, bukan route terpisah) | lazy | Fase 3 |
  | `/game/:gameId` | Mini game (1 chunk per game, D-007) | lazy | Fase 3 |
  | `/report` | Laporan anak | lazy | Fase 3 |
  | `/unlock` | Paywall / kode aktivasi | lazy | Fase 4 |
  | `/parent`, `/parent/*` | Parent Gate + area ortu (laporan, langganan, saran, pengaturan) | lazy + `conditions` gate | Fase 4 |

  - Lazy = `wrap({ asyncComponent: () => import('./routes/X.svelte') })`. Admin **bukan** route: entry Vite terpisah (D-001, FR-13).
  - Alasan: hash tidak butuh rewrite server → jalan sama di GitHub Pages `/studykidsapp/` dan Hostinger tanpa `404.html`/`.htaccess`; route tidak bergantung `VITE_BASE`. Hanya Landing yang perlu SEO, dan Landing ada di `/` tanpa hash. Kedalaman tetap ≤ 3 level (§9.1 no. 5).
  - Budget: router ±3 KB + 4 layar alur pertama di JS awal; sisanya chunk lazy (tidak dihitung, D-007).

  **(b) Store — Svelte 5 runes, bukan `svelte/store`.**
  - File `stores/profile.svelte.ts`, `stores/settings.svelte.ts`, `stores/entitlement.svelte.ts` (folder §11 tetap). Masing-masing class dengan field `$state` dan getter turunan, diekspor sebagai satu instance + factory `createXStore(api: Api)` agar test bisa menyuntik `Api` palsu.
  - `profile`: `list`, `activeId`, getter `active`; `load()`, `create()`, `select()`, `remove()`.
  - `settings`: `locale` = locale profil aktif, atau `DeviceSettings.locale` bila belum ada profil (Landing); `setLocale()` menulis ke profil aktif/perangkat lalu memanggil i18n (ganti teks + `<html lang>`). `prefs` (`autoRead`, `reduceMotion`) milik profil aktif.
  - `entitlement`: di mode `local` selalu `{ plan: 'demo', expiresAt: null }`; batas demo dari `PublicSettings.demo` (satu sumber, tidak disalin). Hanya untuk tampilan; server yang menegakkan (FR-10).
  - Simpan data lewat **pemanggilan method eksplisit** ke `Api` (write-through), bukan `$effect` → mudah diuji, tanpa loop effect. Svelte melarang mengekspor `$state` primitif yang di-assign ulang, maka state dibungkus class.
  - i18n (T2.2): state locale reaktif di file `.svelte.ts` terpisah (mis. `i18n/locale.svelte.ts`); `i18n/index.ts` tetap mengekspor `Locale` & `t` agar impor `../i18n` tidak berubah.
  - Alasan: runes adalah model reaktivitas utama Svelte 5, tanpa boilerplate `writable`/`subscribe`. Budget: 0 KB tambahan (bagian runtime Svelte).

  **(c) Skema Dexie v1** (`services/db.ts`, nama DB tetap `studykids` — tidak ikut `brand.config.ts`, mengganti nama = kehilangan data).

  | Tabel | Indeks Dexie v1 | Isi (tipe di `types.ts`) |
  |---|---|---|
  | `profiles` | `id` | `Profile`: UUID, `serverId`, `nickname`, `grade`, `avatarId`, `locale`, `prefs`, waktu |
  | `settings` | `key` | `SettingRow`: `activeProfileId`, `locale` perangkat |
  | `progressEvents` | `clientEventId, profileId, [profileId+skillId], createdAt` | `ProgressEvent` (cermin `progress_events` §12.1) |
  | `skillMastery` | `[profileId+skillId], profileId` | `SkillMastery` |
  | `syncQueue` | `clientEventId, profileId, enqueuedAt` | `SyncQueueItem` (referensi event, dihapus setelah ack server Fase 4) |

  - **Privasi §8.4:** anak hanya punya nama panggilan, kelas, `avatarId` (salah satu 12 avatar bawaan, bukan unggahan), locale, preferensi, dan progress. Tidak ada field email/HP/foto/lokasi; PIN tidak disimpan lokal (Fase 4, `pin_hash` di server). Token/sesi auth **tidak pernah** ke IndexedDB/`localStorage` (cookie `HttpOnly`, §8.3). `nickname` divalidasi (trim, 1–20 karakter) dan hanya dirender sebagai teks (tanpa `{@html}`).
  - **Idempoten (FR-2, §12.2):** `clientEventId` = UUID v4 dari `crypto.randomUUID()` menjadi PK `progressEvents` dan `syncQueue` → event ganda ditolak oleh PK; `recordProgress` menulis event + mastery + antrian dalam satu transaksi. `randomUUID` tidak ada di Safari iOS 15.0–15.3 (§8.6 iOS 15+) → T2.6 menyediakan fallback v4 dari `crypto.getRandomValues` di `lib/`.
  - **Hapus profil** menghapus baris di semua tabel lewat indeks `profileId` dalam satu transaksi (§8.4 hak hapus).
  - **ID profil lokal = UUID**, bukan angka: aman saat merge ke akun dari beberapa perangkat (FR-2); `serverId` diisi saat merge.
  - Waktu disimpan sebagai string ISO UTC (`toISOString()`), sama dengan server dan bisa diurutkan.
  - **Versi/migrasi:** `db.version(1).stores({...})` sekali. Perubahan **indeks/PK/tabel** = tambah `db.version(n+1).stores({...}).upgrade(tx => …)`; deklarasi versi lama tidak pernah diedit atau dihapus (sama dengan aturan Phinx). Menambah field **tanpa indeks** tidak perlu versi baru (Dexie hanya menyimpan skema indeks); kode baca memberi default untuk baris lama. Setiap versi baru wajib test upgrade: isi data versi lama di IndexedDB tiruan → buka versi baru → data utuh. Handler `versionchange`/`blocked` menutup DB dan meminta muat ulang (dipadukan dengan prompt update SW, T2.9). Kandidat v2 yang sudah terlihat: indeks fingerprint/sesi untuk anti-repeat FR-5 (Fase 3).
  - **Risiko diketahui:** Safari menghapus storage situs (bukan PWA terpasang) setelah 7 hari tanpa interaksi. Mitigasi: `navigator.storage.persist()` saat profil pertama dibuat, dorong install PWA (T2.9), sinkron akun (Fase 4). IndexedDB gagal dibuka → pesan i18n ramah, belajar tetap jalan tanpa simpan (detail T2.6).
  - Budget: Dexie ±30 KB gzip. `db.ts` di-**import dinamis** dari adapter (method `Api` sudah async) → Landing tidak memuat Dexie; JS awal tetap ±25–40 KB.

  **(d) `services/api.ts` — satu interface `Api` (lihat `types.ts`), dua adapter.**
  - Method: `getPublicSettings`, `getEntitlement`, `listProfiles`, `saveProfile`, `deleteProfile`, `getSetting`, `setSetting`, `recordProgress`, `listMastery`. Endpoint akun/auth/order (§13) ditambahkan ke interface saat Fase 4/6, bukan sekarang.
  - Adapter `local`: hanya Dexie + `PublicSettings` dari config lokal (harga §4.2 no. 11, `demo.subjects`, `demo.unit_limit = 2`; `earlyBirdSlotsLeft: null` → penghitung slot disembunyikan, FR-1). **Tanpa request jaringan.**
  - Adapter `api`: menulis ke Dexie dulu (offline-first, §12.2), lalu bicara ke `` `${import.meta.env.BASE_URL}api/` `` (D-003); di Fase 2 berupa stub yang melempar "belum tersedia". Pengiriman `syncQueue` ke `POST /api/sync` ada di `services/sync.ts` (Fase 4). Bentuk JSON di kabel diputuskan di `backend/API.md` Fase 4; adapter memetakan ke tipe ini.
  - Pemilihan: `import.meta.env.VITE_API_MODE === 'api' ? apiAdapter : localAdapter` di `api.ts`. Env dibaca saat build sehingga cabang lain dibuang bundler → build Pages (`local`) tidak membawa kode `fetch`. Budget: hanya satu adapter (±1–2 KB) di bundle.

  **(e) Ikon — SVG buatan sendiri, inline lewat komponen `Icon`.**
  - Set awal (T2.3): `lock`, `speaker`, `star`, `flame` (streak), `check`, `cross`, `arrow-left`, `arrow-right`, `home`, `settings`. `viewBox="0 0 24 24"`, `stroke="currentColor"` (warna dari token lewat `color`), garis membulat agar serasi dengan Kiko. Path disimpan di satu map TS; tanpa `<text>`/`<script>`.
  - Dekoratif → `aria-hidden="true"`; bermakna → label i18n. Status tetap ikon + teks (§8.5).
  - Alasan: emoji tampil berbeda per HP (catatan gate Fase 1 no. 5, [plans/gate-phase-1.md](plans/gate-phase-1.md)); library ikon (mis. Lucide) = dependency + atribusi untuk ±10 ikon. Inline (bukan sprite `<use href>`) → tanpa request tambahan dan tidak terpengaruh base path.
  - Lisensi: karya sendiri, dicatat di `docs/ASSET_LICENSES.md` (T2.3). Budget: ±10 × 200 B ≈ < 1 KB gzip.

  **(f) DOM test env — `jsdom`** (MIT, dev-only), environment per-file lewat komentar `// @vitest-environment jsdom` di test komponen; default Vitest tetap `node` (engine, generator, services).
  - Alasan: AC T2.4 (fokus terjebak di `Modal`, kueri role/label) butuh perilaku DOM yang paling dekat spesifikasi; jsdom adalah env acuan Testing Library. Selisih kecepatan happy-dom tidak berarti untuk puluhan test. Syarat jsdom terbaru Node ≥ 22.22 sudah dipenuhi (lokal v22.23.5, CI Node 24, D-004). happy-dom punya riwayat celah keamanan eksekusi skrip (2024–2025) — risiko kecil untuk test, tapi tidak ada alasan memilihnya.
  - T2.1 memasang `jsdom` + `@testing-library/svelte` dengan ADR dependency (versi, lisensi, ukuran) dan menambah plugin `svelte()` + `svelteTesting()` ke `vitest.config.ts` (dibutuhkan juga untuk menguji store `.svelte.ts`).
  - Budget: 0 KB (tidak masuk bundle).

- **Alternatif:** (a) mode history: butuh rewrite di tiap hosting & `404.html` di Pages. (b) `svelte/store` `writable`: boilerplate subscribe, gaya Svelte 4. (c) satu tabel event dengan kolom `syncedAt` tanpa `syncQueue`: lebih sedikit tabel, tapi rencana fase meminta antrian terpisah yang nanti bisa memuat operasi selain progress. Prefs di tabel `settings` per profil: dua bentuk baris di satu tabel, tipe longgar. (d) fetch langsung dari store: test butuh mock jaringan, mode lokal sulit dijamin tanpa request. (e) emoji / Lucide. (f) happy-dom.
- **Konsekuensi:** perkiraan JS awal setelah Fase 2 = 16,81 KB + router ±3 + workbox-window ±2 + layar alur pertama, komponen & store ±10–15 KB ≈ **35–40 KB** tanpa Dexie (±65–70 KB bila Dexie terpaksa statis), jauh di bawah 120 KB; angka nyata dicatat di T2.5/T2.6/T2.12. Tidak ada dependency baru di ADR ini; `jsdom`, `@testing-library/svelte`, dan (bila dipakai) `fake-indexeddb` diputuskan di ADR T2.1/T2.6.

## D-012 — Dependency test komponen: jsdom + @testing-library/svelte (T2.1, 26 Nov 2026)

- **Status:** diterapkan (melaksanakan D-011 f).
- **Konteks:** Test komponen UI (E1 Fase 2) butuh DOM; engine/services tetap di environment `node`.
- **Keputusan:** dua devDependency di `frontend/` (tidak masuk bundle produksi, 0 KB):
  - `jsdom` ^31.0.1 — MIT, ±6,9 MB unpacked, Node ≥ 22.22 (D-004).
  - `@testing-library/svelte` ^5.4.2 — MIT, ±38 KB, dukung Svelte 5; plugin `svelteTesting()` (auto-cleanup, resolve kondisi browser) ditambah ke `vitest.config.ts` bersama `svelte()`.
- **Pemakaian:** test komponen memakai komentar `// @vitest-environment jsdom` di baris pertama; tanpa komentar = `node`. Tanpa `@testing-library/jest-dom` (assertion cukup dengan `expect` bawaan; tambah bila perlu dengan ADR).
- **Alternatif:** `happy-dom` (lihat D-011 f).
