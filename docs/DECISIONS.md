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

## D-013 — Dependency lapisan data lokal: dexie + fake-indexeddb (T2.6, 26 Nov 2026)

- **Status:** diterapkan (melaksanakan D-011 c/d).
- **Keputusan:**
  - `dexie` ^4.4.7 (runtime) — Apache-2.0, ±3,2 MB unpacked (bundle: `api`+`db`+`sync`+Dexie = 36,6 KB gzip tanpa minify). Di-**import dinamis** dari `services/api.ts` → tidak masuk JS awal (tetap 21,14 KB gzip).
  - `fake-indexeddb` ^6.2.8 (dev) — Apache-2.0, ±0,35 MB unpacked, 0 KB bundle. Dipakai test unit lewat `import 'fake-indexeddb/auto'` (env `node`).
- **Alasan:** Dexie sudah dipilih di stack (CLAUDE.md, D-011). fake-indexeddb = IndexedDB lengkap di Node, tanpa browser untuk test unit; E2E memakai IndexedDB Chromium asli.
- **Alternatif:** `idb` (lebih kecil, tanpa transaksi/kueri indeks majemuk yang nyaman); test hanya lewat Playwright (lambat, TDD sulit).

## D-014 — Engine soal & konten Fase 3 (T3.4, 26 Nov 2026)

- **Status:** diusulkan (T3.4; berlaku setelah PR di-review Bimo — menyentuh engine & skema lokal)
- **Konteks:** Fase 3 membangun engine soal yang jalan 100% di browser (PRD §10.2) dan konten demo 3 mapel × 6 kelas ([plans/phase-3.md](plans/phase-3.md), rencana task [plans/phase-3-T3.4.md](plans/phase-3-T3.4.md)). Acuan: FR-4, FR-5, FR-6, FR-7, FR-9, FR-10 (AC konten Full), §6.2–6.5, §8.1, §8.4, §11, §12.1–12.2; D-007, D-011, D-013. Kontrak tipe: [`frontend/src/engine/types.ts`](../frontend/src/engine/types.ts), diuji `engine/types.test.ts` lewat `satisfies` (contoh unit, indeks, 9 format) → `npm run typecheck` gagal bila tipe menyimpang dari ADR ini.
- **Keputusan:**

  **(a) Skema JSON konten.** Teks selalu `{ "id", "en" }` (§6.4). Dua jenis file per mapel × kelas:

  | File | Isi | Tipe |
  |---|---|---|
  | `content/{subject}/g{grade}/index.json` | semua unit kelas itu, **judul saja** (termasuk unit terkunci) | `GradeIndex` |
  | `content/{subject}/g{grade}/u{n}.json` | unit lengkap: skill + generator + `explain` (bentuk PRD §6.4) | `Unit` |

  ```json
  { "id": "math.g1", "units": [
      { "id": "math.g1.u1", "title": { "id": "Bilangan sampai 20", "en": "Numbers to 20" } },
      { "id": "math.g1.u3", "title": { "id": "Bentuk di sekitarku", "en": "Shapes around me" } } ] }
  ```
  - Unit **terkunci** = ada di `index.json` tetapi tidak punya `u{n}.json` di `src/content/`. Tidak ada flag `locked` di data; status kunci dihitung UI dari entitlement.
  - ID: unit `{subject}.g{grade}.u{n}`, skill `{unitId}.s{n}` (§6.2). Test T3.5 memastikan ID cocok dengan path file, ID skill unik global, ≥ 3 skill/unit, ≥ 1 generator/skill, `formats` ⊆ format yang didukung generator.
  - **Bank soal** = generator `"type": "bank"` dengan `params.items: BankItem[]`. Bentuk item per format: `mcq`/`listen`/`tap` → `correct[]` + `wrong[]` (+ `speak` untuk listen); `input` → `accept[]`; `tf` → `answer`; `order` → `sequence`; `match` → `pairs`; `dragdrop` → `groups`; `draw` → `template?`. `level` item opsional (default 1). Gambar = `AssetKey` (kunci sprite/`?url`), bukan URL → aman di `/studykidsapp/`. Contoh lengkap ada di `engine/types.test.ts`.
  - Validasi skema **hanya di test** (fungsi TS di T3.5, tanpa zod/JSON Schema): konten adalah file bawaan build, bukan input pengguna → 0 KB runtime.

  **(b) Kontrak generator** (`Generator<P>` di `types.ts`; 1 file per tipe di `engine/generators/{area}/`, didaftarkan di `engine/generators/registry.ts`):
  - `generate(rng, params, level, format) → GeneratedQuestion`. Engine melengkapi `skillId`, `generator`, `fingerprint`.
  - `validate(q, given, params) → boolean` menghitung kebenaran **dari `q.core` + `params`, bukan dari `q.answer`** → validator independen (AC FR-5). UI juga memakai `validate` untuk menilai jawaban anak (satu sumber kebenaran).
  - `core` = parameter inti (mis. `{ a: 3, b: 4 }`; bank: `{ item: "i07" }`). **Fingerprint** = `cyrb53(type + "|" + key=value terurut)` dalam hex, **tanpa format** → `3 + 4` sebagai mcq dan input dihitung soal yang sama (FR-5 aturan 2).
  - ID pilihan = nilai kanonik untuk generator (mis. `"7"`) atau `c<n>`/`w<n>` untuk bank → unik per soal, `validate` tidak perlu mengurai teks.
  - Distraktor MCQ dari **kesalahan umum** (FR-5 aturan 4), mis. `arith.add`: lupa menyimpan, ±1, salah kolom; pilihan diacak `rng.shuffle`.

  **(c) Tipe `Question`/`Answer` 9 format** — union terdiskriminasi `format` (`QuestionOf<F>`):

  | Format | Field soal | `Answer` |
  |---|---|---|
  | `mcq` | `choices` (2–4) | id pilihan |
  | `input` | `inputMode: numeric \| text` | string (numeric: `,`→`.` lalu banding angka; text: trim + huruf kecil, dicocokkan ke `accept`) |
  | `tf` | — | boolean |
  | `dragdrop` | `items`, `targets` | `{ itemId: targetId }` |
  | `match` | `left`, `right` | `{ leftId: rightId }` |
  | `order` | `items` (tampil teracak) | id berurutan |
  | `tap` | `choices` | himpunan id benar (bisa > 1) |
  | `listen` | `speak` (dibacakan TTS) + `choices` | id pilihan |
  | `draw` | `template?` | `"done"` (tidak dinilai) |

  Semua soal punya `prompt`, `level`, `hint?` (fallback `Skill.explain`), `core`, `fingerprint`, `answer`. Semua teks `LocalizedText` → ganti bahasa di tengah sesi tidak membuat ulang soal.

  **(d) Seed & counter.** RNG = **mulberry32**, seed 32-bit dari **cyrb53** atas `profileId|skillId|sessionCounter|index` (FR-5 aturan 1 + `index` soal) → tiap soal bisa direproduksi sendiri tanpa memutar ulang sesi. Kedua fungsi ±10 baris, ditulis sendiri (algoritma domain publik), tanpa dependency. `sessionCounter` per `[profileId+skillId]` di tabel Dexie v2 `skillHistory`, **naik saat sesi/run game dimulai** (sesi yang ditinggal tetap memakai counter → sesi berikut tidak identik). Debug: `(profileId, skillId, counter, index)` + riwayat fingerprint → soal yang sama.

  **(e) Adaptif & petunjuk** (FR-5 aturan 5). Level 1–3 (= `ProgressEvent.difficulty`). Level awal dari mastery efektif skill: < 40 → 1, 40–74 → 2, ≥ 75 → 3. Dalam sesi: 2 benar berturut-turut → level +1 (maks 3); 2 salah berturut-turut → level −1 (min 1) **dan** soal berikutnya menampilkan petunjuk (`hint ?? explain`), juga bila sudah level 1; penghitung direset setelah naik/turun. Soal review (f) memakai level dari mastery skill-nya sendiri dan tidak mengubah level skill utama.

  **(f) Sesi, anti-repeat, rotasi, spaced repetition** (`engine/session.ts`, T3.7):
  - Ukuran sesi: kelas 1–2 = 8 soal, kelas 3–6 = 10 soal.
  - **Rotasi format:** tiap soal memilih ref generator (acak) lalu format dari `ref.formats` secara acak, kecuali format yang sudah muncul 3× berturut-turut (FR-5 aturan 3). Skill dengan satu format saja (mis. `draw`) dikecualikan; test mencatatnya.
  - **Anti-repeat:** terlarang = fingerprint di `recent` (5 sesi terakhir skill itu) ∪ sesi ini. Generate ≤ 20× dengan RNG soal yang sama; bila semua terlarang → kandidat yang tidak ada di sesi ini dengan kemunculan **paling lama**; bila tetap tidak ada → kandidat terakhir (pool terlalu kecil, dicatat test). Dalam satu sesi tidak ada fingerprint ganda selama pool ≥ ukuran sesi.
  - **Spaced repetition 20%:** `round(0,2 × ukuran)` = 2 soal dari skill lain **mapel & kelas yang sama** yang pernah dilatih dan mastery efektifnya turun ≥ 5 poin karena decay (g), urut mastery efektif terendah; posisi acak selain soal pertama. Tanpa kandidat → semua soal dari skill utama. Fingerprint soal review masuk `recent` skill review (counter-nya tidak naik).
  - Tiap jawaban → `validate` → `ProgressEvent` → `recordAndEnqueue` (D-011/D-013, satu transaksi). Event **tidak** berisi fingerprint, seed, atau teks jawaban (§8.4); bentuknya tetap cermin `progress_events` §12.1.
  - **Dexie v2:** `this.version(2).stores({ skillHistory: '[profileId+skillId], profileId' })` — hanya tabel baru, versi 1 tidak diedit (D-011 c). Tidak ada data v1 yang diubah (tanpa `upgrade`; counter mulai 0). `recent` maks 5 × 10 fingerprint per skill. Wajib: test migrasi (isi data v1 → buka v2 → data utuh, `skillHistory` bisa ditulis) dan `deleteProfile` ikut menghapus `skillHistory` lewat indeks `profileId` (§8.4). Lokal saja, tidak disinkronkan.

  - *Diterapkan T3.7* ([plans/phase-3-T3.7.md](plans/phase-3-T3.7.md)): `engine/session.ts` (`startSession`, `currentQuestion`, `answer`, `reviewSkills`, `historiesAfter`, `sessionSize`, `levelFor`, `isDone`), tabel kasus di `engine/session.test.ts`. Rincian: soal review juga diseed `rngFor(profileId, skillUtama, counter, index)` → setiap soal sesi direproduksi dari satu tuple; petunjuk setelah 2 salah tampil di soal **skill utama** berikutnya (melewati slot review); rotasi format berlaku lintas skill utama & review. `historiesAfter` idempoten → disimpan setelah start (counter naik) dan setelah tiap jawaban lewat `Api.saveSkillHistory` (sesi yang ditinggal tetap tercatat). Skill review mendapat baris `skillHistory` dengan counter 0 bila belum ada. Mode game (D-014 h) belum: ditambahkan di T3.22.

  **(g) Mastery, bintang, XP, streak** (`engine/mastery.ts`, fungsi murni, T3.6; rumus yang sama di PHP Fase 4 karena server menghitung ulang dari event, §12.2):
  - **Event dinilai** = event skill itu kecuali `format = 'draw'`, urut `createdAt` lalu `clientEventId`.
  - **Mastery tersimpan** (`SkillMastery.mastery`, tanpa decay, deterministik dari event): ≤ 20 event dinilai terbaru, bobot `w_k = 0,8^k` (k = 0 untuk terbaru), `mastery = round(100 × Σ w_k·benar_k / Σ w_k)`; tanpa event → 0. `attempts` = jumlah semua event dinilai. Contoh: 5 benar lalu 1 salah terbaru → `round(100 × (0,8+0,64+0,512+0,41+0,328) / (1+0,8+0,64+0,512+0,41+0,328))` = 73.
  - **Mastery efektif** (dihitung saat dibaca, tidak disimpan): `round(mastery × 0,5^(max(0, d − 3) / 30))`, `d` = hari penuh sejak `lastPracticedAt` (UTC). 3 hari tanpa decay, lalu waktu-paruh 30 hari.
  - **Data belum cukup** (FR-9): laporan tanpa kesimpulan bila total event dinilai profil < 10; skill masuk "Kamu jago di…" hanya bila `attempts` ≥ 10.
  - **Bintang** 0–3: `attempts = 0` → 0; `mastery ≥ 85 && attempts ≥ 10` → 3; `mastery ≥ 60` → 2; selain itu 1. Bintang **tidak pernah turun**: `SkillMastery.stars = max(lama, baru)` (field baru tanpa indeks → tanpa versi Dexie) — FR-7 tanpa rasa gagal.
  - **XP** per event: benar 10, salah 2 (usaha dihargai), `draw` selesai 10. Total di `Profile.xp` (field baru tanpa indeks), diperbarui di transaksi `recordAndEnqueue` (tabel `profiles` ikut transaksi). XP ringkasan sesi = jumlah XP event sesi itu. Level profil/lencana = Fase 5.
  - **Streak** (`Profile.streak: StreakState`): hari = tanggal lokal perangkat `YYYY-MM-DD` dengan ≥ 1 event. Aktivitas di hari `D`: `D = lastDay` → tetap; selisih 1 → `count + 1`; selisih 2 dan minggu ISO hari yang terlewat ≠ `restWeek` → `count + 1` dan `restWeek` = minggu itu (hari libur gratis); selain itu → `count = 1`. UI tidak pernah menampilkan "streak hilang": `count = 1` setelah jeda tampil sebagai ajakan positif (teks i18n).
  - Perubahan `services/types.ts` (`Profile.xp`, `Profile.streak`, `SkillMastery.stars`) dikerjakan T3.6; baris lama dibaca dengan default `0` / `{ count: 0, lastDay: null, restWeek: null }` / bintang dihitung dari mastery.
  - *Diterapkan T3.6* ([plans/phase-3-T3.6.md](plans/phase-3-T3.6.md)): rumus di atas = `engine/mastery.ts` (`masteryOf`, `effectiveMastery`, `starsFor`, `hasEnoughData`, `xpFor`, `sessionXp`, `localDay`, `isoWeek`, `nextStreak`, `nextSkillMastery`, `applyEventToProfile`), tabel kasus di `engine/mastery.test.ts`. Rincian: jam perangkat mundur (`D < lastDay`) → streak tidak berubah; `lastPracticedAt` = `createdAt` event terbaru skill (termasuk `draw`). `Api.recordProgress(event)` tidak lagi menerima mastery: `recordAndEnqueue` menghitung ulang mastery dari semua event skill itu + XP/streak profil dalam transaksi yang sama (klien & server menghitung dari event yang sama). `xp`/`streak` milik `recordProgress`; `saveProfile` me-merge baris lama agar salinan profil di store tidak menimpanya. Default pertanyaan terbuka no. 2 & 3 dipakai.

  **(h) Kontrak mini game** (`GameInfo`, `GameHost`, `GameProps`):
  - `games/registry.ts` berisi `{ id, subject, format, load: () => import('./balloon/Game.svelte') }`; satu-satunya import ke game → 1 chunk lazy per game ≤ 60 KB gzip (sudah dicek `check-bundle-size`, D-007).
  - Game = komponen Svelte dengan props `{ host, paused }`. **Host** (route `#/game/:gameId`) memegang tombol & overlay jeda (Lanjut/Selesai/Keluar), menyediakan `host.nextQuestion()` dari session engine mode game (format tetap = `GameInfo.format`, tanpa review & rotasi; adaptif, anti-repeat, dan counter sama dengan sesi), dan `host.answer()` → validate → event → mastery/XP lewat jalur yang sama dengan sesi. Game **tidak boleh** import Dexie/`api.ts` → chunk kecil, data satu jalur.
  - Skill untuk game: skill terbuka (unit ≤ `demo.unitLimit`) mapel game & kelas profil yang ref-nya mendukung `format`; pilih mastery efektif terendah di antara yang pernah dilatih, kalau belum ada → skill pertama unit 1.
  - Durasi 60–120 dtk dan skor ditangani game; jawaban yang sudah terkirim tetap tersimpan saat Keluar. Logika game murni di `games/{id}/logic.ts` agar bisa di-unit-test.

  **(i) Pemuatan konten** (`engine/content.ts`):
  ```ts
  const units = import.meta.glob<Unit>('../content/*/g*/u*.json', { import: 'default' });
  const indexes = import.meta.glob<GradeIndex>('../content/*/g*/index.json', { import: 'default' });
  ```
  - Tiap file = chunk lazy sendiri; `loadUnit(id)` mengembalikan `null` bila file tidak ada (unit terkunci). Engine hanya diimpor route lazy (peta, sesi, game, laporan) → **JS awal tidak naik** (AC T3.5).
  - **Aturan 15 KB gzip/unit** (§8.1): `check-bundle-size` menambah pemeriksaan chunk manifest dengan `src` diawali `src/content/` (pola sama dengan `gameChunkErrors`), aktif di T3.5. Yang diukur chunk JS hasil Vite (sedikit lebih besar dari JSON mentah → lebih ketat).
  - **Konten Full terpisah (FR-10):** `src/content/` hanya boleh berisi `u{n}.json` untuk `demo.subjects` dengan `n ≤ demo.unitLimit` (dari `public-settings.local.json`); test T3.5 menegakkannya. Konten Full (Fase 5) tidak pernah masuk bundle publik; cara kirimnya (API + token bertanda tangan) diputuskan ADR Fase 4.
  - **Offline:** chunk konten diberi nama `assets/content/[name]-[hash].js` (`chunkFileNames`), dikecualikan dari precache (`globIgnores`) dan di-cache **CacheFirst** saat dibuka (§8.2 "konten yang sudah dibuka") → instal PWA tidak mengunduh semua konten. E2E offline (T3.15) membuka skill sekali saat online.

  **(j) Kriteria uji bank vs generator** (harness T3.5 menjalankan **semua** skill di `content/` otomatis):
  - **Generator** (`type ≠ bank`): per skill × ref × format, 1.000 percobaan (seed `harness|skillId|i`, level `i % 3 + 1`) → **≥ 50 fingerprint unik**; 100% `validate(q, q.answer)` benar; `mcq`/`listen`: 2–4 pilihan, id unik, tepat 1 pilihan lolos `validate`; `tap`: setiap pilihan salah gagal; `tf`: kebalikan jawaban gagal; seed sama → soal sama (`toEqual`).
  - **Bank** (§6.5): **≥ 20 item dasar per skill** (id unik), 100% item lolos `validate`, setiap item muncul dalam 1.000 percobaan, dan **≥ 50 varian tampil unik** (fingerprint + urutan id pilihan) per 1.000 seed. Skill yang hanya berisi item `draw`/`tf` cukup ≥ 20 item (tidak bisa diacak).
  - Bank 20 item dengan sesi 8–10 soal hanya cukup ±2 sesi tanpa ulangan; sesudahnya berlaku fallback "paling lama" di (f). Lihat pertanyaan no. 1.

  **(k) Coverage `engine/` ≥ 80%** (§15.1): devDependency **`@vitest/coverage-v8`** (MIT, versi = versi `vitest` terpasang, dev-only, 0 KB bundle) dipasang di T3.5 dengan entri versi/ukuran di sini. `vitest.config.ts`: `coverage: { provider: 'v8', include: ['src/engine/**/*.ts'], exclude: ['**/*.test.ts', 'src/engine/types.ts'], thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 } }`; script `test` = `vitest run --coverage` → `npm run check` gagal bila < 80%. *Terpasang T3.5:* `@vitest/coverage-v8@5.1.1` (MIT, ±30 KB unpacked, dev-only, 0 KB bundle).

- **Dampak budget (§8.1):** JS awal **+0 KB** (engine, konten, generator, game lazy). Perkiraan chunk engine (rng + registry + session + mastery + loader + generator demo) ≤ 15 KB gzip; per unit ≤ 15 KB dan per game ≤ 60 KB (dicek CI); Dexie v2 +0 KB. Tanpa dependency runtime baru; satu devDependency (k).
- **Privasi (§8.4):** bentuk event tidak berubah (tanpa fingerprint/seed/teks bebas); `skillHistory` hanya hash parameter soal, lokal, ikut terhapus bersama profil.
- **Alternatif:** (a) satu file konten per kelas (> 15 KB dan memuat unit terkunci ke perangkat); flag `locked` di JSON (duplikasi entitlement). (b) `checkAnswer` generik di UI + `validate` hanya di test (dua sumber kebenaran). (d) satu RNG per sesi (soal ke-n bergantung soal sebelumnya → debug sulit); `seedrandom` (dependency untuk 20 baris). (f) fingerprint di `progressEvents` (mengubah cermin tabel server, ikut tersinkron). (g) mastery berdecay yang disimpan (server tidak bisa menghitung ulang identik); EWMA tanpa jendela (event lama tidak pernah hilang pengaruhnya); bintang dari mastery saat ini (bisa turun). (h) game dengan `mount()` framework-agnostik (lebih banyak kode lem). (i) precache semua konten (unduhan ±150–500 KB saat instal). (k) `@vitest/coverage-istanbul` (instrumentasi, lebih lambat).
- **Konsekuensi:** T3.5 = rng/fingerprint/registry/harness/loader/aturan 15 KB/coverage; T3.6 = mastery/bintang/XP/streak + field baru `services/types.ts`; T3.7 = session + Dexie v2 + `deleteProfile`; T3.12–T3.13 memakai `QuestionOf<F>`; T3.22–T3.23 memakai `GameProps`. Server Fase 4 memakai rumus (g) yang sama (tabel kasus dibagi lewat fixture JSON). Route peta: D-011 menulis `/subject/:subjectId`, rencana Fase 3 `#/map/:subject` — T3.14 memakai `#/map/:subject` dan memperbarui tabel D-011 a.
- **Pertanyaan terbuka untuk Bimo** (default di atas dipakai bila tidak dijawab):
  1. Bank soal minimal 20 item/skill (§6.5) membuat anti-repeat 5 sesi tidak bisa penuh (8–10 soal/sesi butuh ±50 item). Default: tetap 20, ulangan memilih soal yang paling lama tidak muncul. Naikkan minimal bank ke 40–50 item untuk GP/Art? (menambah kerja konten T3.19–T3.21)
  2. XP: benar 10, salah 2, gambar selesai 10 — oke, atau salah = 0?
  3. Streak dihitung per tanggal perangkat anak (bukan UTC) — oke?
