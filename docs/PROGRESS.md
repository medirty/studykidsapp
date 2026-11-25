# PROGRESS — StudyKids

> Wajib di-update setiap akhir sesi. Rencana detail per fase: `docs/plans/phase-<n>.md`.
> Tag model: `[opus]` → `/next` mendelegasikan ke subagent `architect`; `[sonnet]` → dikerjakan sesi utama.

## Status

- **Fase aktif:** 1 — Mockup & Brand (rencana dibuat 24 Nov 2026, `docs/plans/phase-1.md`; pertanyaan Fase 1 terjawab, T1.0–T1.6 selesai, B10 disetujui, siap `/next` → T1.7)
- **Posisi terakhir (tutup hari 24 Nov 2026, sesi ke-2):** T1.0 (PR #31, #32), T1.1 (PR #33), T1.2 (PR #34) selesai & ter-merge ke `main`; PR #35 (duplikat logo) ditutup. Tidak ada PR terbuka, tidak ada task setengah jalan. Branch lokal basi bisa dihapus (`chore/f1-cleanup-gate0`, `docs/f1-plan*`, `feat/f1-logo-kiko`).
- **Task berikutnya:** `/next` → T1.7 `[sonnet]` Layar 4 Peta belajar (T1.6 selesai; tujuan tautan mapel di beranda: `peta-belajar.html`). **Catatan sesi berikut:** restart Claude Desktop agar `mysql` di PATH aktif (satu-satunya ✗ di doctor); mojibake `â€”` di `docs/setup/BOOTSTRAP.md` belum diperbaiki (di luar scope).
- **Persetujuan fase:** Fase 0 **disetujui** Bimo (24 Nov 2026) setelah T0.12a, T0.12, `/gate`, dan B8 selesai. Tag `phase-0-approved`. Fase berikut: 1 — Mockup & Brand (butuh `/plan-phase`). Temuan gate yang belum dikerjakan: M-1 (pecah job deploy Pages), L-1 (Dependabot #19/#20), B1 domain.

## Fase 1 — Mockup & Brand (rencana: `docs/plans/phase-1.md`)

### Task
- [x] T1.0 `[sonnet]` Bersih-bersih gate Fase 0: Dependabot #19/#20 (L-1), pecah job deploy Pages (M-1) + sertakan `docs/mockups/` ke artefak Pages di `/studykidsapp/mockups/` (izin Bimo sudah ada)
  - Bukti (24 Nov 2026): PR #31 (job deploy dipecah + `docs/mockups/` ke artefak Pages) & #19 (setup-node 7) di-merge; #20 (TS 7) ditutup atas perintah Bimo (alasan D-004). Run Deploy Pages sukses; `https://medirty.github.io/studykidsapp/` → 200, `/mockups/` → 200. Tidak ada PR Dependabot terbuka.
- [x] T1.1 `[sonnet]` Design tokens final + self-host Baloo 2/Nunito + test kontras AA (§9.2, §8.5)
  - Bukti (24 Nov 2026): `npm run check` hijau — vitest 28/28 (22 test kontras baru `contrast.test.ts`), JS awal 16,81 KB / CSS 1,06 KB gzip. Font variabel latin self-host 72 KB (di luar budget awal), lisensi OFL dicatat. Tabel kontras: `docs/brand/tokens.md`. **Temuan:** English `#8B5CF6` gagal 4,5:1 (putih 4,23) → dipakai teks besar saja; usulan `#7C3AED` menunggu keputusan Bimo (T1.15). Belum diverifikasi: path font di build `VITE_BASE=/studykidsapp/` (isi `dist/` diblok deny rule) — cek visual saat Pages ter-deploy.
- [x] T1.2 `[sonnet]` Logo final Kiko: ikon, horizontal, satu warna/putih, wordmark path, favicon & PWA PNG (§9.4)
  - Bukti (24 Nov 2026): 7 SVG + 4 PNG (favicon-32, 192, 512, maskable-512) + galeri `docs/brand/index.html` (screenshot dicek: Kiko terbaca di 32 px, satu warna & putih jalan). Ikon ≤ 0,7 KB; logo horizontal ±6 KB; wordmark = path (outline Baloo 2 w800, tanpa tag `<text>`). Tanpa ikon terlarang. Lisensi dicatat. Belum disetujui resmi → B10 (setelah T1.3). Kiko di favicon tanpa bintang/titik agar bersih di 32 px.
- [x] T1.3 `[sonnet]` 4 ekspresi Kiko + 4 avatar contoh (§9.4, FR-2) → B10
  - Bukti (25 Nov 2026): 8 SVG baru (`docs/brand/kiko/` senang/semangat/kaget/tidur; `docs/brand/avatar/` Pipo/Luna/Bima/Momo), semua ≤ 1 KB (batas 6 KB), XML valid, tanpa `<text>`/`<script>`. Tampil di `docs/brand/index.html` (screenshot dicek; aksesori avatar & percikan "semangat" diperbaiki setelah cek pertama). "Semangat" = alis naik + senyum lebar terbuka, tanpa air mata/cemberut (§9.1 no. 4). Lisensi dicatat. B10 disetujui 25 Nov 2026.
- [x] T1.4 `[sonnet]` Kerangka `docs/mockups/` (galeri, mockup.css dari token) + Playwright 360/1280 + axe (§9.3, §8.5)
  - Bukti (25 Nov 2026): `npm run check` hijau (JS 16,81 KB gzip). `npm run test:e2e` → 12 lolos (6 smoke + 6 mockup: 3 halaman × 360/1280, dijalankan di project desktop; glob `docs/mockups/*.html`). Axe sempat menangkap pelanggaran nyata (aria-label tombol ID/EN tidak memuat teks terlihat) → diperbaiki. Screenshot 360 px dicek (font Baloo/Nunito termuat). Halaman: galeri, `contoh-komponen.html`, `frame.html` (bingkai HP). **Perubahan workflow Pages:** `deploy-pages.yml` kini juga menyalin `docs/brand/` dan `tokens.css` ke artefak agar mockup jalan di Pages — belum diuji di Pages (cek setelah merge).
- [x] T1.5 `[sonnet]` Layar 1 Landing page (FR-1)
  - Bukti (25 Nov 2026): `docs/mockups/landing.html` (hero Kiko, keunggulan, 8 mapel berwarna, soal contoh tap, harga Rp50.000 + sisa slot contoh "dari server", FAQ, CTA "Coba Gratis" → `pilih-kelas.html`, dibuat di T1.6). `npm run test:e2e` → 14 lolos, landing 360 & 1280 px: tanpa scroll horizontal + axe bersih. Galeri ditautkan. Belum dicek visual (browser MCP memblokir `file:`); cek di Pages setelah deploy.
- [x] T1.6 `[sonnet]` Layar 2–3 Pilih kelas/profil + Beranda anak, varian kelas 1–2 & 5–6 (FR-2, FR-7)
  - Bukti (25 Nov 2026): `pilih-kelas.html` (kelas 1–6 + 4 profil avatar, PIN ditandai 🔒), `beranda.html` (kelas 1–2: 🔊 besar, tombol 72 px) & `beranda-besar.html` (kelas 5–6: daftar ringkas). Jalur ≤ 3 tap: kelas → mapel → peta. Streak berbahasa positif, tanpa pesan "streak hilang"; gembok = ikon + teks. `npm run test:e2e` → 20 lolos (tiap halaman 360 & 1280: tanpa scroll horizontal + axe bersih; overflow 360 px di grid kelas sempat gagal → diperbaiki). `npm run check` hijau (JS 16,81 KB). Tautan ke `peta-belajar.html` & `laporan.html` menunggu T1.7/T1.12. Belum dicek visual (cek di Pages).
- [ ] T1.7 `[sonnet]` Layar 4 Peta belajar (FR-4)
- [ ] T1.8 `[sonnet]` Layar 5a Soal mcq/input/tf/tap/listen (FR-5, FR-8)
- [ ] T1.9 `[sonnet]` Layar 5b Soal dragdrop/match/order/draw (FR-5)
- [ ] T1.10 `[sonnet]` Layar 6–7 Feedback benar/salah + Ringkasan sesi (FR-5, FR-7)
- [ ] T1.11 `[sonnet]` Layar 8 Mini game "Balon Angka" (FR-6)
- [ ] T1.12 `[sonnet]` Layar 9 Laporan anak & ortu (FR-9)
- [ ] T1.13 `[sonnet]` Layar 10 Parent Gate, paywall/kode aktivasi, kritik & saran (FR-2, FR-10, FR-12)
- [ ] T1.14 `[sonnet]` Layar 11 Admin: dashboard, penjualan, marketing tools (FR-13, FR-14)
- [ ] T1.15 `[sonnet]` Review aksesibilitas & konsistensi + paket persetujuan → B11
- [ ] Gate `[opus]` `/gate` → Bimo menulis "Fase 1 disetujui" → tag `phase-1-approved`

### Tindakan manual Bimo
- [x] B10 Logo final + 4 ekspresi Kiko disetujui Bimo ("Logo disetujui", 25 Nov 2026)
- [ ] B11 Setujui semua mockup (setelah T1.15)

### Keputusan Bimo untuk Fase 1 (24 Nov 2026)
1. ~~Cara melihat mockup~~ — **dipasang di GitHub Pages** (`/studykidsapp/mockups/`). Izin mengubah workflow deploy sudah diberikan; dikerjakan di T1.0 (bersama pecah job deploy, M-1).
2. ~~PR mockup/logo~~ — **boleh di-merge sebagai draft** setelah CI hijau; persetujuan resmi sekali di B10 (logo) & B11 (semua layar).
3. ~~Avatar~~ — **4 contoh** di Fase 1, 12 lengkap di Fase 2.

## Fase 0 — Setup (rencana: `docs/plans/phase-0.md`)

### Sudah selesai (sesi pembuka, 21 Nov 2026)
- [x] Hubungkan folder ke `github.com/medirty/studykidsapp`, `.gitignore`, `.gitattributes`, `LICENSE` — commit `6f4eca6` di `main`
- [x] `.claude/` routing model (opusplan + 4 subagent + 5 command) sudah ada
- [x] `gh` CLI terpasang & login
- [x] `docs/PROGRESS.md` + `docs/plans/phase-0.md`

### Task
- [x] T0.0 `[sonnet]` **Bootstrap tooling** — jalankan `docs/setup/BOOTSTRAP.md` (cek software, install plugin/skill/MCP otomatis, settings.json + hook) — **kerjakan pertama**
- [x] T0.1 `[sonnet]` `docs/SETUP_LOCAL.md` + `scripts/doctor.mjs` (§17.1) — doctor juga cek item BOOTSTRAP Langkah 1–4, mode `--quiet`
  - Bukti (21 Nov 2026): `node --test scripts/lib/doctor-utils.test.mjs` → 7/7 pass. `node scripts/doctor.mjs` → 18/19 OK, exit 1 (✗ `mysql` di PATH: sudah di PATH user, aktif setelah restart Claude Desktop). Uji gagal sengaja: port 8000 diduduki → ✗ + saran, exit 1. Waktu jalan ±1,5 detik.
- [x] T0.2 `[sonnet]` Kerangka dokumen: README, DECISIONS, CHANGELOG, CHANGE_REQUESTS, ASSET_LICENSES, `.env.example` (§11, §18)
  - Bukti (22 Nov 2026): 7 file dibuat; cek link relatif antar dokumen → 0 rusak; grep nilai rahasia di 2 `.env.example` → kosong; kedua file tidak di-ignore Git; `node scripts/doctor.mjs --quiet` → exit 0. CR-001 sudah disalin ke `CHANGE_REQUESTS.md`.
- [x] T0.3 `[opus]` ADR layout repo, kontrak script & env, daftar dependency + lisensi (§10, §11, §8.1) — **catat bukti delegasi `/next` → architect (E4)**
  - Bukti (22 Nov 2026): ADR D-001–D-007 di `docs/DECISIONS.md` (layout + npm workspaces, kontrak script, kontrak env, versi runtime, dependency FE/BE + lisensi, cek budget). Versi/lisensi/engines dicek di registry npm & Packagist (tanpa install). Cek link relatif → 0 rusak; grep rahasia → bersih; `node scripts/doctor.mjs --quiet` → exit 0. Temuan: ESLint 10/jsdom 31/LHCI 0.16 butuh Node > 22.12 → B9; TypeScript dikunci ~6.0; PHPUnit ^11.5 (12+ butuh PHP ≥ 8.3).
- [x] T0.4 `[sonnet]` Scaffold frontend Svelte 5 + Vite + TS strict, struktur folder, hello-world, `VITE_BASE` (§10.1, §11, §17.5)
  - Bukti (22 Nov 2026): `npm run build` sukses (JS 14,76 KB gzip, CSS 0,63 KB); `tsc --noEmit` bersih. Build `VITE_BASE=/studykidsapp/` + `vite preview` → `/studykidsapp/assets/index-*.js` & `.css` 200 OK (dicek lewat browser karena `dist/` diblok deny rule; Bimo mengizinkan verifikasi). Tampilan 360 px rapi, tanpa scroll horizontal; judul diganti ke Ink karena oranye di atas krem < 3:1. **Jebakan Windows:** Git Bash mengubah `VITE_BASE=/studykidsapp/` jadi `C:/Program Files/Git/...` → pakai `MSYS_NO_PATHCONV=1` atau PowerShell (CI Linux tidak terdampak). Catatan: `engines.node` sementara `>=22.12` dan doctor belum dinaikkan ke 22.22 karena B9 (upgrade Node) belum dilakukan; font Baloo 2/Nunito masih fallback sistem.
- [x] T0.5 `[sonnet]` ESLint/Prettier/svelte-check/Vitest + `check-bundle-size` + `npm run check` (§8.1, §15)
  - Bukti (22 Nov 2026): `npm run check` (root) hijau: eslint+prettier bersih, svelte-check 0 error/0 warning, vitest 3/3, build, size → JS awal 14,21 KB / CSS 0,62 KB gzip. `npm run test:scripts` → 14/14 (7 test baru bundle-size, TDD). Pelanggaran sengaja: `console.log` → lint gagal (`no-console`); JS dibengkakkan jadi 414 KB → `check-bundle-size` exit 1 + pesan "JS awal ... > batas". `engines.node` & doctor dinaikkan ke ≥ 22.22. Dependency sesuai D-005 (tanpa tambahan). Catatan: aturan batas JSON konten (15 KB) belum aktif (belum ada konten; Fase 2/3); `test:scripts` ditambah di root (belum bagian `check`, akan masuk CI di T0.10).
- [x] T0.6 `[sonnet]` Playwright (Pixel 5, iPhone 12, desktop) + axe-core smoke test (§15.1)
  - Bukti (22 Nov 2026): `npm run test:e2e` → 6/6 lolos (2 test × 3 project: tanpa scroll horizontal + axe 0 pelanggaran serius/kritis). `npm run check` tetap hijau (JS 14,21 KB gzip). Dependency sesuai D-005. Catatan: ketiga project memakai Chromium (iPhone 12 = viewport/UA saja, bukan WebKit) agar unduhan ringan; E2E belum bagian `check` (masuk CI di T0.10).
- [x] T0.7 `[opus]` Scaffold backend Slim 4 + PDO + `/api/health` + PHPUnit/PHPStan/CS-Fixer (§10.1, §11, §8.3) — butuh B2, B3
  - Bukti (23 Nov 2026, delegasi → architect; rencana `docs/plans/phase-0-T0.7.md`): `composer test` (PHP 8.2.12 XAMPP) → OK 4 test/14 assertion; `npm run test:api` (PHP 8.4.28) → OK 4/14; `composer lint` & `npm run lint:api` → PHPStan level 6 "No errors", CS-Fixer "0 of 8 files can be fixed". `php -S localhost:8000 -t backend/public` → `GET /api/health` = 200 `{"status":"ok","db":"ok"}`; `/api/nope` = 404 JSON. DB mati → 503 `{"status":"ok","db":"error"}` tanpa detail (diuji PHPUnit). `npm run test:scripts` 16/16, `npm run check` hijau (JS 14,21 KB). Dependency sesuai D-006 (tanpa tambahan). Catatan: header keamanan §8.3 (CSP/HSTS dsb.) & path `.env` di hosting belum (Fase 4 deploy); `X-Powered-By` diatur `expose_php=Off` di server.
- [x] T0.8 `[opus]` Phinx + `npm run db:reset` dengan pengaman env (§17.1) — butuh B4
  - Bukti (23 Nov 2026, delegasi → architect; rencana `docs/plans/phase-0-T0.8.md`): Phinx 0.16.12 (D-006). Migrasi awal `settings` (key, value_json; PRD §12.1) + `SettingsSeeder` (5 kunci PRD §4.2). `npm run test:scripts` → 22/22 (6 test baru `db-guard`, TDD). `APP_ENV=local npm run db:reset` → rollback + migrate + seed sukses di `studykids_dev` (exit 0, run kedua membuktikan rollback); `--test` → sukses di `studykids_test`. Ditolak (exit 1, pesan jelas): `APP_ENV=production`, `APP_ENV=development`, `DB_NAME=studykids_prod`, `DB_TEST_NAME` kosong. `composer test` (8.2.12) & `npm run test:api` (8.4.28) → OK 4/14; `composer lint`/`lint:api` → PHPStan "No errors", CS-Fixer 0/11; `npm run check` hijau (JS 14,21 KB). **Perlu Bimo:** `backend/.env` berisi `APP_ENV=development` (di luar kontrak D-003) dan tanpa `DB_TEST_NAME` → ganti ke `APP_ENV=local` dan tambah `DB_TEST_NAME=studykids_test` agar `npm run db:reset` jalan tanpa override.
- [x] T0.9 `[sonnet]` `npm run dev` (concurrently + proxy `/api`) → status API & DB tampil (§17.1)
  - Bukti (23 Nov 2026): `npm run dev` → Vite :5173 + `php -S` :8000 (PHP_BIN via run-php); `curl localhost:5173/api/health` lewat proxy → 200 `{"status":"ok","db":"ok"}`. Browser 360 px: teks "API ok, DB ok", tanpa scroll horizontal. TDD: 4 test baru `health.test.ts` (ok, DB error, jaringan putus, non-JSON). `npm run check` hijau (JS 16,81 KB gzip), `test:e2e` 6/6, `test:scripts` 22/22, `test:api` 4/14, `lint:api` bersih. `concurrently` ^10 sesuai D-005. Dev server selalu memakai `VITE_API_MODE=api` (di `vite.config.ts`, command serve); build/preview ikut `.env` (Pages = local, status disembunyikan). Catatan: 1 error konsol `favicon.ico` 404 (belum ada favicon, bukan scope).
- [x] T0.10 `[sonnet]` CI (`ci.yml`, MySQL service, PHP 8.2/8.4, Lighthouse CI) + Dependabot (§15.1, §17.3)
  - Bukti (23 Nov 2026, PR #17): run CI https://github.com/medirty/studykidsapp/actions/runs/45133253754 → frontend, lighthouse, backend PHP 8.2 & 8.4 semuanya hijau. Lighthouse (mobile, perf ≥ 0,9, LCP < 2,5 s, CLS < 0,1) juga lolos lokal. `@lhci/cli` via `npx` (D-005). Dependabot mingguan: npm, composer, github-actions. **Bug ditemukan CI:** migrasi `settings` gagal di MySQL 8 (kolom PK nullable; MariaDB toleran) → diperbaiki dengan `'null' => false` di migrasi lama atas izin Bimo (belum pernah dipakai di produksi). Setelah merge: B8 (proteksi branch `main`) kini bisa dikerjakan; nama check: `frontend`, `lighthouse`, `backend (php 8.2)`, `backend (php 8.4)`.
- [x] CR-004 `[sonnet]` Ganti XAMPP → MariaDB 11.8 (Bagian A–C) — sebelum T0.12
  - Bukti (23 Nov 2026): MariaDB 11.8.2 service Running/Automatic; `scripts/db-setup.ps1` jalan 2× (idempotent); `npm run db:reset` OK; `npm run test:api` OK 5 tes (termasuk sesi UTC/strict/collation); `test:scripts` 24/24; doctor 21/22 (sisa ✗: PATH bin MariaDB, aktif setelah restart Claude Desktop). B5 `Database.php` dikerjakan langsung di sesi utama (perubahan kecil, skema tidak berubah). PRD v1.10. Bukti CI & `npm run dev` di bawah.
- [x] T0.11 `[sonnet]` `deploy-pages.yml` → hello-world di GitHub Pages (§17.5) — butuh B6
  - Bukti (24 Nov 2026): `.github/workflows/deploy-pages.yml` (push `main` + manual → build `VITE_BASE=/studykidsapp/`, `VITE_API_MODE=local` → upload `frontend/dist` → deploy). Build lokal dengan env itu sukses, `npm run check` hijau (JS 15,54 KB gzip). PR #22 di-merge atas persetujuan Bimo (24 Nov 2026). Run pertama gagal (artefak belum terbaca, jeda sesaat); rerun sukses. `https://medirty.github.io/studykidsapp/` → 200, `index.html` + JS + CSS di `/studykidsapp/assets/` semuanya 200.
- [x] T0.12a `[sonnet]` (CR-003) Verifikasi di sesi baru: skill `ponytail` & `security-review` muncul, nama di `skills:` agent cocok, `/ponytail-help` jalan, doctor bersih
  - Bukti (24 Nov 2026, sesi baru setelah `/clear`): daftar skill sesi memuat `ponytail:ponytail`, `ponytail:ponytail-help`, `security-review`; hook SessionStart menyuntikkan "PONYTAIL MODE ACTIVE". `skills:` di agent: architect & reviewer = `ponytail`+`security-review`, implementer = `ponytail` (cocok PRD §16.4.1). `node scripts/doctor.mjs` → 22/22 OK (✗ `mysql` PATH sebelumnya sudah hilang).
- [x] T0.12 `[sonnet]` Verifikasi plugin/MCP + rangkum bukti Exit Criteria (§16.2, §16.4)
  - Bukti (24 Nov 2026): `claude plugin list` → superpowers 7.0.2, frontend-design 1.1.1, ponytail 5.3.3 enabled (scope project); tanpa claude-mem. MCP project (playwright, context7, chrome-devtools) tersedia di sesi. `.claude/settings.json`: `opusplan`, hook doctor, deny rule lockfile/node_modules/.env. Exit Criteria E1–E4 terbukti di tabel bawah.
- [x] Gate `[opus]` `/gate` → laporan `docs/plans/gate-phase-0.md` (siap persetujuan); Bimo menulis "Fase 0 disetujui" (24 Nov 2026, setelah B8) → tag `phase-0-approved`

### Dijadwalkan (CR-003)
- [ ] **Awal Fase 4** `[sonnet]` Evaluasi graphify (PRD §16.4.2): mode code-only lokal, tanpa Cloud/git hook, `graphify-out/` di `.gitignore`; lolos jika token/file yang dibaca turun nyata pada 3 task eksplorasi dan tanpa error di Windows. Catat hasil di `DECISIONS.md`. Masukkan ke `docs/plans/phase-4.md` saat `/plan-phase` Fase 4.

### Change Request
- [~] **CR-003** Skill tambahan (ponytail, security-review; graphify ditunda) — disetujui Bimo 23 Nov 2026 → PRD **v1.9** (§16.4.1–16.4.2), `CLAUDE.md`, `.claude/agents`, BOOTSTRAP, PANDUAN. Bagian A (dokumen) selesai; Bagian B: ponytail & security-review terpasang (23 Nov 2026, D-008), tinggal verifikasi di sesi baru (daftar skill, `/ponytail-help`, doctor bersih). Detail: `docs/plans/CR-003-skills-ponytail-graphify-ecc.md`.
- [x] **CR-002** Bantuan langsung saat task terblokir tindakan manual — diterima Bimo & diterapkan 22 Nov 2026 → PRD **v1.8** (§16.5), `CLAUDE.md`, `.claude/commands/next.md`. Detail: `docs/CHANGE_REQUESTS.md`.
- [x] **CR-001** Aturan subagent & auto-merge PR — disetujui Bimo, diterapkan 21 Nov 2026 → PRD **v1.7** (§16.2 aturan subagent, §17.5 auto-merge + kategori wajib review), `CLAUDE.md`, `docs/PANDUAN_VIBE_CODING.md`. Arsip: `docs/plans/CR-001-subagent-dan-auto-merge.md`. Saat T0.2 membuat `docs/CHANGE_REQUESTS.md`, salin entri ini ke sana.

### Tindakan manual Bimo
- [ ] B1 Beli domain `studykids.id`
- [x] B2 PHP 8.4.28 di `C:\php-8.4`, 8 ekstensi aktif (21 Nov 2026). PATH sistem tidak diubah — pakai `PHP_BIN`
- [x] B3 (diganti CR-004) Database = MariaDB 11.8 service, menyala otomatis
- [x] B4 User MySQL `studykids` (hak hanya ke 2 DB) + DB `studykids_dev` & `studykids_test` (utf8mb4); `backend/.env` terisi, di-ignore Git (21 Nov 2026)
- [x] B5 (terverifikasi via API) Aktifkan Secret scanning & Push protection di repo
- [x] B6 (terverifikasi via API) Pages → Source: GitHub Actions
- [x] B7 Setujui instalasi plugin/skill/MCP saat T0.0 berjalan (dipasang otomatis oleh Claude)
- [x] B8 Proteksi branch `main` — dipasang via `gh api` (24 Nov 2026): 4 required checks (`frontend`, `lighthouse`, `backend (php 8.2)`, `backend (php 8.4)`), force push & hapus branch dilarang, auto-merge aktif. `enforce_admins=false` (Bimo owner tunggal tetap bisa bypass darurat)
- [x] B9 Upgrade Node — selesai 22 Nov 2026: Node **22.23.5** (memenuhi ≥ 22.22; bukan 24, cukup untuk T0.5). Perintah yang benar `winget upgrade --id OpenJS.NodeJS.22 --exact` (ID `OpenJS.NodeJS.LTS` tidak cocok). Alasan: `docs/DECISIONS.md` D-004

### Bukti Exit Criteria
| Kriteria | Bukti |
|---|---|
| E1 `npm run check` & `composer test` hijau di CI | Dibuktikan ulang dengan `mariadb:11.8` (CR-004), lihat bukti CR-004 |
| E2 `npm run dev` → frontend + API + DB lokal | T0.9: "API ok, DB ok" di 360 px, 23 Nov 2026 |
| E3 Hello-world di GitHub Pages | T0.11: https://medirty.github.io/studykidsapp/ → 200, aset 200 (24 Nov 2026) |
| E4 `/next` mendelegasikan `[opus]` ke architect | T0.3: delegasi /next → architect, 22 Nov 2026 |

### Pertanyaan terbuka untuk Bimo
1. ~~Path PHP~~ — **terjawab:** `C:\php-8.4` (CLAUDE.md & PRD v1.5 sudah sama).
2. ~~Merge PR~~ — **terjawab (21 Nov 2026):** Claude boleh merge sendiri setelah CI hijau (squash merge; sebelum CI ada di T0.10, PR docs/chore boleh di-merge setelah dicek).
3. ~~claude-mem~~ — **terjawab (PRD v1.6):** tidak dipakai. Memori project = PROGRESS.md, DECISIONS.md, docs/plans, Git.

