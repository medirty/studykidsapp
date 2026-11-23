# PROGRESS — StudyKids

> Wajib di-update setiap akhir sesi. Rencana detail per fase: `docs/plans/phase-<n>.md`.
> Tag model: `[opus]` → `/next` mendelegasikan ke subagent `architect`; `[sonnet]` → dikerjakan sesi utama.

## Status

- **Fase aktif:** 0 — Setup
- **Posisi terakhir:** rencana Fase 0 dibuat (21 Nov 2026). T0.0 Bootstrap selesai (21 Nov 2026, lihat tabel di `docs/setup/BOOTSTRAP.md`). T0.1 doctor + SETUP_LOCAL selesai (21 Nov 2026, PR #4). CR-001 diterapkan → PRD v1.7 (PR #5). Tutup hari 21 Nov 2026: tidak ada PR terbuka, tidak ada task setengah jalan. T0.2 kerangka dokumen selesai (22 Nov 2026). T0.3 ADR selesai (22 Nov 2026, delegasi `/next` → architect). T0.4 scaffold frontend selesai (22 Nov 2026). T0.5 tooling frontend + `npm run check` selesai (22 Nov 2026). T0.6 Playwright + axe-core selesai (22 Nov 2026). Task berikutnya: **T0.7** `[opus]` backend Slim 4. CR-002 diterapkan (PRD v1.8, 22 Nov 2026). CR-003 disetujui (23 Nov 2026): dokumen diterapkan di branch `docs/cr-003-skills` (PRD v1.9), instalasi ponytail & security-review berjalan; verifikasi di sesi baru.
- **Catatan sesi berikut:** restart Claude Desktop agar `mysql` di PATH aktif (satu-satunya ✗ di doctor). Bagian atas `docs/setup/BOOTSTRAP.md` masih ada mojibake (`â€”`), belum diperbaiki (di luar scope).
- **Persetujuan fase:** belum ada.

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
- [ ] T0.7 `[opus]` Scaffold backend Slim 4 + PDO + `/api/health` + PHPUnit/PHPStan/CS-Fixer (§10.1, §11, §8.3) — butuh B2, B3
- [ ] T0.8 `[opus]` Phinx + `npm run db:reset` dengan pengaman env (§17.1) — butuh B4
- [ ] T0.9 `[sonnet]` `npm run dev` (concurrently + proxy `/api`) → status API & DB tampil (§17.1)
- [ ] T0.10 `[sonnet]` CI (`ci.yml`, MySQL service, PHP 8.2/8.4, Lighthouse CI) + Dependabot (§15.1, §17.3)
- [ ] T0.11 `[sonnet]` `deploy-pages.yml` → hello-world di GitHub Pages (§17.5) — butuh B6
- [ ] T0.12a `[sonnet]` (CR-003) Verifikasi di sesi baru: skill `ponytail` & `security-review` muncul, nama di `skills:` agent cocok, `/ponytail-help` jalan, doctor bersih
- [ ] T0.12 `[sonnet]` Verifikasi plugin/MCP + rangkum bukti Exit Criteria (§16.2, §16.4)
- [ ] Gate `[opus]` `/gate` → Bimo menulis "Fase 0 disetujui" → tag `phase-0-approved`

### Dijadwalkan (CR-003)
- [ ] **Awal Fase 4** `[sonnet]` Evaluasi graphify (PRD §16.4.2): mode code-only lokal, tanpa Cloud/git hook, `graphify-out/` di `.gitignore`; lolos jika token/file yang dibaca turun nyata pada 3 task eksplorasi dan tanpa error di Windows. Catat hasil di `DECISIONS.md`. Masukkan ke `docs/plans/phase-4.md` saat `/plan-phase` Fase 4.

### Change Request
- [~] **CR-003** Skill tambahan (ponytail, security-review; graphify ditunda) — disetujui Bimo 23 Nov 2026 → PRD **v1.9** (§16.4.1–16.4.2), `CLAUDE.md`, `.claude/agents`, BOOTSTRAP, PANDUAN. Bagian A (dokumen) selesai; Bagian B: ponytail & security-review terpasang (23 Nov 2026, D-008), tinggal verifikasi di sesi baru (daftar skill, `/ponytail-help`, doctor bersih). Detail: `docs/plans/CR-003-skills-ponytail-graphify-ecc.md`.
- [x] **CR-002** Bantuan langsung saat task terblokir tindakan manual — diterima Bimo & diterapkan 22 Nov 2026 → PRD **v1.8** (§16.5), `CLAUDE.md`, `.claude/commands/next.md`. Detail: `docs/CHANGE_REQUESTS.md`.
- [x] **CR-001** Aturan subagent & auto-merge PR — disetujui Bimo, diterapkan 21 Nov 2026 → PRD **v1.7** (§16.2 aturan subagent, §17.5 auto-merge + kategori wajib review), `CLAUDE.md`, `docs/PANDUAN_VIBE_CODING.md`. Arsip: `docs/plans/CR-001-subagent-dan-auto-merge.md`. Saat T0.2 membuat `docs/CHANGE_REQUESTS.md`, salin entri ini ke sana.

### Tindakan manual Bimo
- [ ] B1 Beli domain `studykids.id`
- [x] B2 PHP 8.4.28 di `C:\php-8.4`, 8 ekstensi aktif (21 Nov 2026). PATH sistem tidak diubah — pakai `PHP_BIN`
- [ ] B3 Start MySQL di XAMPP setiap mulai kerja (PATH `mysql` diurus T0.0)
- [x] B4 User MySQL `studykids` (hak hanya ke 2 DB) + DB `studykids_dev` & `studykids_test` (utf8mb4); `backend/.env` terisi, di-ignore Git (21 Nov 2026)
- [x] B5 (terverifikasi via API) Aktifkan Secret scanning & Push protection di repo
- [x] B6 (terverifikasi via API) Pages → Source: GitHub Actions
- [x] B7 Setujui instalasi plugin/skill/MCP saat T0.0 berjalan (dipasang otomatis oleh Claude)
- [ ] B8 Proteksi branch `main` (setelah T0.10)
- [x] B9 Upgrade Node — selesai 22 Nov 2026: Node **22.23.5** (memenuhi ≥ 22.22; bukan 24, cukup untuk T0.5). Perintah yang benar `winget upgrade --id OpenJS.NodeJS.22 --exact` (ID `OpenJS.NodeJS.LTS` tidak cocok). Alasan: `docs/DECISIONS.md` D-004

### Bukti Exit Criteria
| Kriteria | Bukti |
|---|---|
| E1 `npm run check` & `composer test` hijau di CI | — |
| E2 `npm run dev` → frontend + API + DB lokal | — |
| E3 Hello-world di GitHub Pages | — |
| E4 `/next` mendelegasikan `[opus]` ke architect | T0.3: delegasi /next → architect, 22 Nov 2026 |

### Pertanyaan terbuka untuk Bimo
1. ~~Path PHP~~ — **terjawab:** `C:\php-8.4` (CLAUDE.md & PRD v1.5 sudah sama).
2. ~~Merge PR~~ — **terjawab (21 Nov 2026):** Claude boleh merge sendiri setelah CI hijau (squash merge; sebelum CI ada di T0.10, PR docs/chore boleh di-merge setelah dicek).
3. ~~claude-mem~~ — **terjawab (PRD v1.6):** tidak dipakai. Memori project = PROGRESS.md, DECISIONS.md, docs/plans, Git.

