# CLAUDE.md — Aturan Kerja StudyKids

Kamu adalah implementer untuk **StudyKids** (web app belajar SD kelas 1–6, kurikulum terinspirasi Cambridge Primary, ID/EN, mobile-first).
**`PRD.md` adalah sumber kebenaran.** File ini hanya ringkasan aturan. Jika ragu → baca § yang relevan di PRD → jika tetap tidak jelas, **BERTANYA**, jangan menebak.

## Mulai setiap sesi

0. **Bootstrap tooling:** jika `docs/setup/BOOTSTRAP.md` berstatus `BELUM`, atau output hook `doctor` di awal sesi menunjukkan item `✗`, jalankan prosedur di `docs/setup/BOOTSTRAP.md` dulu (install otomatis yang kurang, minta izin Bimo per instalasi), baru lanjut ke task.
1. Baca file ini + `docs/PROGRESS.md`.
2. Ambil **satu** task teratas yang belum selesai di fase aktif. Satu sesi = satu task.
3. Baca hanya bagian PRD yang dirujuk task itu (sebut nomor §). Jangan baca seluruh PRD kecuali diminta.
4. Selesai → update `docs/PROGRESS.md` → commit → laporkan ringkas → sarankan `/clear`.

## Model routing OTOMATIS (hemat limit Claude Pro) — PRD §16.2

Jika folder `claude-setup/` masih ada: rename menjadi `.claude/` dulu (Fase 0, langkah pertama), lalu minta Bimo restart Claude Code.
Bimo tidak mengganti model manual. Routing diatur oleh `.claude/settings.json` (`opusplan`), subagent di `.claude/agents/`, dan command di `.claude/commands/`.

- Sesi utama = **Sonnet**. Plan mode = Opus (otomatis lewat `opusplan`).
- Task bertag `[opus]` di `PROGRESS.md` → **delegasikan ke subagent `architect`**. Task `[sonnet]` → kerjakan sendiri (boleh pakai `implementer`/`tester`).
- **Eskalasi wajib ke `architect` tanpa diminta** jika: menyentuh skema DB, API, auth, pembayaran, engine soal/mastery; perbaikan bug gagal 2×; perlu keputusan arsitektur baru.
- Review akhir fase & review keamanan → subagent `reviewer` (Opus) lewat `/gate`.
- Saat membuat task (`/plan-phase`), beri setiap task tag `[opus]` atau `[sonnet]` sesuai tabel PRD §16.2.
- Jangan pernah set `CLAUDE_CODE_SUBAGENT_MODEL`.
- Simpan rencana di `docs/plans/` supaya tidak dibuat ulang. Jangan buka `node_modules/`, `vendor/`, `dist/`, lockfile.
- Jika limit hampir habis: tulis posisi terakhir ("task X, langkah Y") di `PROGRESS.md` sebelum berhenti.
- **Memori project = file repo** (`PROGRESS.md`, `DECISIONS.md`, `docs/plans/`, Git). Selalu update di akhir task. **Jangan pasang claude-mem** atau plugin memori lain (PRD §16.4).

## Phase gate (WAJIB)

- Ikuti roadmap PRD §14 secara berurutan: 0 Setup → 1 Mockup & Brand → 2 Fondasi FE → 3 Engine + Demo → 4 Backend & Akun → 5 Konten Full + Admin + Marketing → 6 Pembayaran → 7 Hardening & Launch.
- **Dilarang lanjut fase** sebelum Exit Criteria terpenuhi, bukti dicatat di `PROGRESS.md`, dan Bimo menulis "Fase X disetujui".
- **Mockup dulu** (Fase 1) sebelum membangun sistem. **Pembayaran paling akhir** (Fase 6).

## Stack (jangan diganti tanpa persetujuan)

Frontend: Svelte 5 + Vite + TypeScript strict, CSS variables, Dexie (IndexedDB), vite-plugin-pwa, uPlot (lazy).
Backend: PHP 8.4 (lokal `C:\php-8.4\php.exe` lewat `PHP_BIN`; kode kompatibel 8.2+) + Slim 4 + PDO, MySQL/MariaDB, Phinx, PHPMailer.
Test: Vitest, Playwright (mobile viewport), PHPUnit, Lighthouse CI, axe-core.
Hosting: Hostinger (shared, hosting-agnostic — setting deploy hanya di GitHub Secrets). Preview: GitHub Pages dengan `VITE_API_MODE=local`.
Dev lokal (Windows): XAMPP **hanya** untuk MySQL/MariaDB (PHP pakai `C:\php-8.4` via `PHP_BIN`, bukan PHP XAMPP); jangan pakai Apache/htdocs. Jalankan `npm run dev` (Vite :5173 + `php -S` :8000, proxy `/api`). Akses DB lewat `mysql` CLI & Phinx, tanpa MCP database. Detail PRD §17.1.

## Bisnis (jangan diubah tanpa CR)

- Domain `studykids.id`. Maskot Kiko. Logo fun, bukan "sekolah" (PRD §9.4).
- Demo: Math, Global Perspectives, Art & Design — unit 1–2 saja (`demo.unit_limit = 2`).
- Harga: Rp50.000 untuk 100 pembeli pertama (`paid`), lalu Rp100.000. Kuota dicek di server dalam transaksi DB; harga dikunci saat order dibuat; pending kedaluwarsa 60 menit (PRD §4.2). Semua angka dari tabel `settings`.

## Aturan coding

- Ikuti struktur folder PRD §11 dan pola yang sudah ada.
- Fungsi kecil (≤ 40 baris), satu tanggung jawab, nama kode dalam bahasa Inggris.
- Logika murni (`frontend/src/engine/`) terpisah dari UI; konten = JSON, bukan kode.
- Semua teks UI lewat i18n (`id` + `en`); semua warna lewat `styles/tokens.css`; nama brand lewat `brand.config.ts`; harga dari settings/server.
- Soal dibuat generator dengan seeded RNG; patuhi aturan variasi & anti-repeat (PRD FR-5).
- Backend: prepared statements, validasi input server, CSRF, rate limit, cek kepemilikan data (anti-IDOR) di setiap endpoint.
- Patuhi performance budget PRD §8.1 (JS awal ≤ 120 KB gzip). Mini game & admin = chunk lazy terpisah.
- Speech hanya Web Speech API bawaan perangkat, sebagai progressive enhancement.

## Testing & Definition of Done

- TDD untuk engine, generator, mastery, dan backend services (skill `superpowers:test-driven-development`).
- Task selesai hanya jika: AC PRD terpenuhi, semua test lolos, lint/typecheck/format bersih, dicek di viewport 360 px, tanpa `console.log`/`var_dump`, `PROGRESS.md` di-update.
- Sebelum bilang "selesai/fixed": **jalankan perintahnya dan tunjukkan hasilnya** (skill `verification-before-completion`).
- Bug: reproduksi dengan test gagal → cari akar masalah (skill `systematic-debugging`) → perbaiki → catat di `CHANGELOG.md`.

## Dilarang

- Menambah fitur di luar PRD atau mengubah PRD diam-diam.
- Menambah dependency tanpa alasan di `docs/DECISIONS.md` (cek lisensi & ukuran).
- Mengubah skema DB tanpa migrasi Phinx baru; mengedit migrasi lama.
- Menghapus/skip test agar CI hijau.
- Hardcode secret, teks UI, warna, harga. Commit `.env`.
- Refactor besar di luar task (tulis sebagai saran di `DECISIONS.md`).
- Memakai logo/teks/soal Cambridge atau aset tanpa lisensi jelas (catat lisensi di `docs/ASSET_LICENSES.md`).
- Pelacak pihak ketiga di area anak; menyimpan email/foto/nomor HP/lokasi anak.

## Perubahan PRD / fitur baru

Ikuti PRD §18: catat di `docs/CHANGE_REQUESTS.md` → analisis dampak → tunggu keputusan Bimo → naikkan versi PRD → tambah task di `PROGRESS.md` → kerjakan dengan DoD → jalankan seluruh test suite.

## Slash command

`/next` (task berikutnya) · `/plan-phase` (pecah fase jadi task) · `/fix <bug>` · `/gate` (review akhir fase) · `/cr <perubahan>`

## Perintah

```bash
npm run dev          # frontend + API lokal sekaligus
npm run db:reset     # reset DB dev + migrate + seed
# frontend
npm run build | npm run check   # check = lint + typecheck + unit test + bundle size
npm run test:e2e
# backend
composer test | composer lint
vendor/bin/phinx migrate
```

## Git & GitHub — repo `medirty/studykidsapp` (PRD §17.5)

- Jangan push langsung ke `main`. Satu task = satu branch (`feat/f<fase>-<nama>`, `fix/...`, `docs/...`) → PR via `gh pr create` dengan bukti test → merge hanya jika CI hijau. **Claude boleh merge sendiri** (`gh pr merge --squash --delete-branch`) setelah CI hijau.
- Conventional commits: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`. Commit kecil & rapi.
- **Repo PUBLIC:** jangan pernah force push; jangan commit `.env`, secret, key, dump DB, data pengguna, atau screenshot berisi data anak. Hanya `.env.example` tanpa nilai asli. Semua pengecekan keamanan tetap di server.
- Build GitHub Pages memakai `VITE_BASE=/studykidsapp/`; produksi `VITE_BASE=/`. Jangan hardcode path absolut `/`.
- Rilis = tag semver; akhir fase yang disetujui = tag `phase-N-approved`.
