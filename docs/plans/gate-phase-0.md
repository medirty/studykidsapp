# Gate Fase 0 — Setup (laporan reviewer)

- **Tanggal:** 24 Nov 2026
- **Reviewer:** subagent `reviewer` (Opus), lewat `/gate`
- **Commit diperiksa:** `8f7b94b` (`main`, setelah PR #24)
- **Rujukan:** PRD §14 (Exit Criteria Fase 0), §15 (test, DoD, keamanan), §16.5, §17.5
- **Verdict:** **Siap untuk persetujuan Bimo** (lihat syarat yang disarankan di bawah)

> Reviewer tidak menyetujui fase. Hanya Bimo yang boleh menulis "Fase 0 disetujui".
> Catatan: PROGRESS mencatat Bimo sudah menulis "Fase 0 disetujui" sebelum gate ini dijalankan; persetujuan itu perlu ditegaskan ulang setelah membaca laporan ini.

## 1. Exit Criteria (PRD §14)

| # | Kriteria | Bukti (dijalankan 24 Nov 2026) | Status |
|---|---|---|---|
| E1 | `npm run check` & `composer test` hijau di CI | Run CI `45416003952` (push `main`, PR #24): job `frontend`, `lighthouse`, `backend (php 8.2)`, `backend (php 8.4)` semuanya **success**. Log: vitest 7/7, E2E 6/6, `composer test` → `OK (5 tests, 17 assertions)`. Lokal: `npm run check` hijau (eslint+prettier bersih, svelte-check 0 error/0 warning, vitest 7/7, build, size OK). | PASS |
| E2 | `npm run dev` → frontend + API + koneksi DB lokal | Dijalankan ulang oleh reviewer: `http://localhost:5173/` → 200; `http://localhost:5173/api/health` (lewat proxy Vite) → 200 `{"status":"ok","db":"ok"}`; `http://localhost:8000/api/health` → 200 sama. Server dimatikan lagi setelah cek. | PASS |
| E3 | Hello-world tampil di GitHub Pages | `curl https://medirty.github.io/studykidsapp/` → **200**. Run Deploy Pages terakhir `45416003855` → success. | PASS |
| E4 | `/next` mendelegasikan task `[opus]` ke subagent `architect` | Bukti dokumenter: PROGRESS T0.3, T0.7, T0.8 dicatat "delegasi → architect", rencana tersimpan di `docs/plans/phase-0-T0.3.md`, `phase-0-T0.7.md`, `phase-0-T0.8.md`. Tidak bisa diputar ulang dari sesi reviewer (subagent tidak boleh memanggil subagent). | PASS (dokumenter) |

## 2. Hasil perintah verifikasi

| Perintah | Hasil |
|---|---|
| `npm run check` | Hijau. JS awal **16,81 KB gzip** (batas 120 KB), CSS 0,64 KB (batas 25 KB), "Budget OK" |
| `npm run test:scripts` | 24/24 pass, 0 fail |
| `npm run test:e2e` | 6/6 pass (Pixel 5, iPhone 12, desktop × tanpa scroll horizontal + axe 0 pelanggaran serius) |
| `npm run test:api` | PHPUnit 11.5.58, PHP 8.4.28 → `OK (5 tests, 17 assertions)` |
| `npm run lint:api` | PHPStan "No errors"; PHP-CS-Fixer "0 of 12 files can be fixed" |
| Lighthouse CI (job `lighthouse`, run `45416003952`) | Assertion perf ≥ 0,9, LCP < 2500 ms, CLS < 0,1 → lolos (job success) |
| `node scripts/doctor.mjs` | 22/22 OK, exit 0 |
| `gh run list --branch main` | CI hijau di semua push `main` terakhir; Deploy Pages: 1 gagal (run `45415268552`, PR #23), lalu sukses di run berikutnya |
| `npm audit` / `composer audit` | 0 vulnerabilities / "No security vulnerability advisories found" |

## 3. Keamanan (lingkup Fase 0)

Checklist §15.3 (SQLi, XSS, CSRF, brute force, IDOR, webhook, admin 2FA, race kuota early bird) berlaku untuk Fase 4 & 7. Di Fase 0 hanya ada `GET /api/health`, jadi yang diperiksa adalah fondasinya:

| Item | Temuan | Status |
|---|---|---|
| Secret/.env di repo | `git ls-files` hanya memuat `.env.example` dan `backend/.env.example` (tanpa nilai asli, `DB_PASS=` kosong). Riwayat Git: tidak pernah ada `.env` asli yang ditambahkan. | PASS |
| `.gitignore` (§17.5 butir 2) | Memuat `node_modules/`, `vendor/`, `dist/`, `.env`, `.env.*` (kecuali example), `backend/.env`, `*.log`, `.DS_Store`, `coverage/`, `playwright-report/`, dump DB. `git check-ignore` membuktikan `.env`, `frontend/.env`, `backend/.env` di-ignore. | PASS |
| Secret scanning & push protection | API repo: `secret_scanning: enabled`, `secret_scanning_push_protection: enabled`. | PASS |
| Secret di bundle | Frontend hanya membaca `import.meta.env.VITE_API_MODE` (nilai publik). Tidak ada variabel DB/server yang diekspos ke Vite. (Isi `dist/` tidak dibaca langsung karena deny rule.) | PASS |
| SQL injection | Satu query (`SELECT 1`) lewat prepared statement; `ATTR_EMULATE_PREPARES=false`, `ERRMODE_EXCEPTION`. | PASS |
| Kebocoran error | Error middleware `displayErrorDetails=false`, JSON; detail DB hanya ke `error_log`. Password DB ditandai `#[\SensitiveParameter]`. | PASS |
| Proteksi branch `main` (§17.5) | `gh api .../branches/main/protection` → **404 "Branch not protected"**; rulesets `[]`. Lihat temuan H-1. | FAIL (bukan Exit Criteria) |
| Dependabot | Version updates aktif (npm, composer, github-actions). `dependabot_security_updates: disabled`. Lihat L-5. | Sebagian |

## 4. Kepatuhan CLAUDE.md / DoD

| Item | Temuan | Status |
|---|---|---|
| Tanpa `console.log`/`var_dump` | Grep seluruh repo (tanpa `node_modules`/`vendor`/`dist`): hanya muncul di dokumen/contoh skill, tidak ada di kode. Lint `no-console` aktif. | PASS |
| Dependency tercatat di DECISIONS | Semua paket di `package.json` (root + frontend) dan `backend/composer.json` ada di D-005/D-006 dengan versi & lisensi. Tidak ada paket liar. | PASS |
| Migrasi `utf8mb4_unicode_ci`, waktu UTC | `Database.php` men-set sesi UTC + `utf8mb4_unicode_ci` + strict mode; diuji PHPUnit (5 test). | PASS |
| Viewport 360 px | E2E Pixel 5 (393 px) & iPhone 12 (390 px) + bukti manual 360 px di T0.4/T0.9. | PASS |
| Stack sesuai PRD §10.1 | Svelte 5 + Vite + TS strict, Slim 4 + PDO, Phinx, PHPUnit, Playwright, LHCI. | PASS |

## 5. Ringkasan `/ponytail-review` atas perubahan Fase 0

- Kode backend kecil dan tepat sasaran (1 controller, 1 factory, 1 kelas DB, 1 migrasi + seeder). Tidak ada abstraksi "untuk nanti" yang mengganggu; folder kosong hanya `.gitkeep` sesuai struktur §11.
- `php-di` adalah satu-satunya tambahan yang bisa dipertanyakan untuk satu endpoint, tapi sudah diputuskan dan dicatat (D-006) untuk wiring Fase 4. Tidak perlu diubah.
- Script `scripts/lib/*` punya test (24 test). Tidak ada kode yang perlu dihapus.
- Satu hal yang layak disederhanakan/dibetulkan: workflow Pages (M-1).

## 6. Temuan (berperingkat)

| ID | Tingkat | Temuan | Saran |
|---|---|---|---|
| H-1 | **Tinggi** | Branch `main` belum dilindungi (B8). Repo public; §17.5 mewajibkan `main` tidak boleh push langsung/force push dan merge hanya lewat PR dengan CI hijau. Saat ini push langsung & force push secara teknis masih mungkin. Bukan Exit Criteria §14, jadi tidak menggagalkan gate, tapi ini kontrol keamanan Fase 0 yang dijadwalkan "setelah T0.10" dan T0.10 sudah selesai. | Kerjakan B8 sebelum tag `phase-0-approved`: wajib PR, required checks `frontend`, `lighthouse`, `backend (php 8.2)`, `backend (php 8.4)`, larang force push & penghapusan. Ikuti protokol CR-002 (Claude coba via `gh api` dengan izin Bimo, atau langkah klik-demi-klik). Aktifkan juga "Allow auto-merge" (§17.5). |
| M-1 | Sedang | Deploy Pages tidak stabil: 2 dari 4 percobaan gagal dengan `No artifacts named "github-pages" were found` (run pertama PR #22 dan run `45415268552` PR #23). Upload & deploy di job yang sama. Situs tetap 200 karena run berikutnya sukses, tapi demo Fase 3 bisa tertunda tanpa disadari. | Pisah menjadi job `build` (upload artifact) dan job `deploy` (`needs: build`), sesuai template resmi GitHub. Tambahkan cek status Pages di laporan task. |
| L-1 | Rendah | PR Dependabot terbuka: #19 (`actions/setup-node` 4→7, bentrok) dan #20 (TypeScript 7, bertentangan dengan D-004 `~6.0`). | #19: rebase (`@dependabot rebase`) lalu merge bila CI hijau. #20: tutup dan tambah `ignore` major TypeScript di `dependabot.yml` sampai ADR baru. Keduanya kategori "Dependabot major" → perlu persetujuan Bimo. |
| L-2 | Rendah | B1 (domain `studykids.id`) belum dibeli. Bukan Exit Criteria §14 (hanya "Isi" fase; PRD §1 menulis "SEBAIKNYA segera dibeli di Fase 0"). Risiko bisnis: domain diambil orang. Tidak dibutuhkan teknis sebelum Fase 4. | Bimo membeli secepatnya; tidak menghalangi gate. |
| L-3 | Rendah | `npm run lint:api` dari root memberi peringatan PHP-CS-Fixer "Unable to determine minimum PHP version ... Failed to read file composer.json" (CWD = root). Aturan yang bergantung versi PHP bisa tidak aktif saat lint lokal; CI (`composer lint` di `backend/`) tidak terdampak. | Jalankan CS-Fixer dengan CWD `backend/` di `run-php`/script, atau set `->setRiskyAllowed`/target PHP di config. |
| L-4 | Rendah | `npm run test:e2e` lokal mencetak banyak `http proxy error: /api/health ECONNREFUSED` (dev server tanpa API). Test tetap lolos; hanya bising. Build CI/Lighthouse tanpa `VITE_API_MODE` juga akan mencoba memanggil `/api/health`. | Set `VITE_API_MODE=local` untuk webServer E2E & build Lighthouse, atau biarkan sampai Fase 2 (mode lokal). |
| L-5 | Rendah | Dependabot *security updates* nonaktif (hanya version updates). | Aktifkan di Settings → Code security (gratis). |
| L-6 | Rendah | Mojibake (`â€”`, `Â§`) di bagian atas `docs/setup/BOOTSTRAP.md` (sudah diketahui). | Perbaiki encoding di task docs kecil. |
| I-1 | Info | E4 hanya bisa dibuktikan secara dokumenter (catatan PROGRESS + file rencana architect). | Cukup untuk gate; tidak perlu tindakan. |
| I-2 | Info | `lighthouserc.json` baru menegakkan perf/LCP/CLS. Ambang aksesibilitas & ukuran (§8.1) belum di LHCI (sudah dicek oleh axe & `check-bundle-size`). | Tambah saat Fase 2 (Exit Criteria Lighthouse ≥ 90). |

Bug kritis: **0**. Bug tinggi: **1** (H-1, konfigurasi repo, bukan kode).

## 7. Penilaian B1 & B8 terhadap Exit Criteria

- Exit Criteria Fase 0 di PRD §14 hanya E1–E4; keempatnya PASS. B1 dan B8 tidak tercantum di kolom Exit Criteria, jadi **tidak menghalangi gate** secara formal.
- PRD §16.5 (CR-002) mengatur cara menangani item `B*` yang memblokir task, bukan syarat gate.
- Namun B8 adalah aturan wajib §17.5 untuk repo public dan prasyarat auto-merge `--auto`. Reviewer menyarankan B8 diselesaikan **sebelum** tag `phase-0-approved` dibuat.

## 8. Verdict

**Siap untuk persetujuan Bimo.**

Disarankan sebelum tag `phase-0-approved`: (1) H-1 proteksi branch `main` (B8). Setelahnya, kapan saja di awal Fase 1: M-1, L-1, L-5; B1 secepatnya demi bisnis.
