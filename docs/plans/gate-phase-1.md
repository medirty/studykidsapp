# Gate Fase 1 — Mockup & Brand (laporan reviewer)

- **Tanggal:** 25 Nov 2026 · **Branch:** `main` @ `6462d56` (tree bersih) · **Reviewer:** subagent `reviewer`
- **Acuan:** PRD §14 baris Fase 1 ("Bimo menyetujui mockup & logo secara tertulis"), §9.2–§9.4, §6.1 (Cambridge), §4.2 (harga, CR-006), §15.2 DoD; `docs/plans/phase-1.md` E1–E4.
- Laporan ini **tidak** menyetujui fase. Hanya Bimo yang boleh menulis "Fase 1 disetujui".

## 1. Hasil per Exit Criterion

| # | Kriteria | Status | Bukti |
|---|---|---|---|
| E1 | Logo final disetujui Bimo tertulis; AC §9.4 (dikenali di 32×32, satu warna, wordmark path, ikon PWA) | ✓ | B10 dicentang ("Logo disetujui", 25 Nov 2026) di `PROGRESS.md`. Dicek ulang: `favicon-32.png` 32×32, `icon-192` 192×192, `icon-512` & `icon-maskable-512` 512×512 (dilihat langsung, Kiko jelas di 32 px). Varian `kiko-icon-ink/white`, `logo-horizontal-ink/white` ada. Tidak ada `<text>`/`<script>`/`font-family` di SVG final (hanya di file konsep v1/v2). Tanpa ikon terlarang (buku, toga, dll.). Lisensi tercatat di `docs/ASSET_LICENSES.md`. |
| E2 | Design tokens final, kontras AA terbukti | ✓ (dengan 1 keputusan terbuka) | `npm run check`: vitest **28/28 lolos** (22 test kontras di `tests/unit/contrast.test.ts`). English `#8B5CF6` hanya 4,23:1 dengan putih → dicatat sebagai pengecualian (teks besar saja). Dicek: di mockup `--subject-english` hanya dipakai sebagai border kartu & swatch, bukan teks kecil. Keputusan warna `#7C3AED` **menunggu Bimo**. |
| E3 | Mockup HTML statis semua 11 layar §9.3, mobile 360 px & desktop 1280 px, di `docs/mockups/` | ✗ (1 bug) | 36 halaman HTML, checklist 11 layar di `docs/mockups/README.md` cocok dengan file. `npm run test:e2e`: **78 passed, 144 skipped** (mockup dicek sekali di project desktop pada 360 & 1280: tanpa scroll horizontal + axe 0 serius/kritis). Pengecekan tambahan reviewer di mode **EN**: 72/72 halaman×viewport lolos axe & tanpa overflow. **Tetapi** `soal-listen.html` (format soal "listen") menampilkan **soal tanpa pilihan jawaban** di mode default ID (bug B-1 di bawah, dibuktikan dengan Playwright + screenshot). Layar 5 "tiap format soal" jadi belum lengkap secara visual. |
| E4 | Bimo menyetujui mockup tertulis (B11) | ✓ (diperbarui 25 Nov 2026) | Bimo menulis "sudah saya review, mockup oke"; B11 dicentang di `PROGRESS.md`. Keputusan warna English belum dikonfirmasi. Catatan: persetujuan ini diberikan sebelum B-1 s/d B-4 diperbaiki, jadi perbaikan kecil di bawah tidak mengubah tampilan yang sudah disetujui kecuali B-1 (soal listen). |

### Perintah yang dijalankan (hasil nyata)

| Perintah | Hasil |
|---|---|
| `npm run check` | lint bersih; `svelte-check` 138 file, 0 error, 0 warning; vitest 3 file, **28 passed**; build OK; **JS awal 16,81 KB gzip** (batas 120), CSS 1,06 KB (batas 25) → "Budget OK" |
| `npm run test:e2e` | **78 passed**, 144 skipped (skip = project mobile, by design). Log `ECONNREFUSED /api/health` muncul karena API PHP tidak jalan; smoke test tetap lolos |
| `npm run test:api` (PHPUnit, PHP 8.4.28) | **OK (5 tests, 17 assertions)** — tidak ada regresi |
| `npm run lint:api` (phpstan + php-cs-fixer) | 0 dari 12 file perlu diperbaiki |
| `npm run test:scripts` | 24/24 lolos |
| `npm audit --omit=dev` | 0 vulnerabilities |
| `gh run list --branch main --limit 6` | CI & Deploy Pages **success** untuk #50, #51, #52 (terakhir 25 Nov 09:53 UTC) |
| Cek GitHub Pages | `/studykidsapp/mockups/`, `landing.html`, `paywall.html`, `admin-marketing.html`, `assets/tokens.css`, `brand/index.html`, SVG Kiko/logo → semua **200**. Font app `/studykidsapp/fonts/*.woff2` → 200 (catatan T1.1 "path font belum diverifikasi" kini terjawab) |
| Skrip reviewer: kontrol tersembunyi & gambar rusak, 36 halaman × ID/EN @360 | Hanya 1 temuan: 4 tombol jawaban `soal-listen.html` tersembunyi di mode ID |

### Konsistensi bisnis (CR-006, PRD v1.12 §4.2)
- `landing`, `paywall`, `langganan`, `admin-*` sudah model **langganan**: bulanan Rp50.000 early bird / Rp100.000 normal, tahunan Rp500.000 (=10×), "Hemat 2 bulan", harga terkunci, perpanjangan manual, masa tenggang, progres aman. Tidak ada sisa teks "sekali bayar/selamanya".
- Harga ditandai sebagai contoh "dari server / settings" (komentar + catatan di `landing.html` & `paywall.html`). Wajar untuk mockup statis.
- Angka slot konsisten: sisa 37 (terjual 63/100) di landing, paywall, admin marketing.
- Cambridge: hanya kalimat "terinspirasi kurikulum Cambridge Primary" (diizinkan §6.1); tidak ada logo/soal Cambridge. **Disclaimer footer belum ada** (B-3).

### Keamanan (security-review, scope Fase 1)
Fase 1 hanya HTML/CSS statis; auth, pembayaran, webhook, IDOR, kuota early bird **belum ada kodenya** → di luar scope (diuji di Fase 4/6). Yang dicek: tidak ada `.env`/key/dump di `git ls-files`; tidak ada secret di `git grep`; `npm audit` 0; satu `innerHTML` di `landing.html` hanya berisi string statis (bukan input pengguna); tidak ada skrip/font pihak ketiga di mockup (semua lokal). Mockup admin login sudah menampilkan 2FA. Tidak ada temuan keamanan.

## 2. Yang harus diperbaiki (sebelum B11)

| ID | Keparahan | Temuan | Perbaikan kecil |
|---|---|---|---|
| B-1 | **Sedang (blocker visual)** | `docs/mockups/soal-listen.html:28` — tombol `cat/hat/bat/mat` memakai `lang="en"` (benar untuk pelafalan), tetapi `assets/mockup.css:42` menyembunyikan **semua** `[lang='en']` saat mode ID. Hasil: layar soal "listen" tampil tanpa pilihan jawaban (Playwright: `cat:false … mat:false` di ID, `true` di EN). axe & test overflow tidak menangkapnya. | Batasi selektor toggle ke label UI, mis. `html[data-lang='id'] span[lang='en'], html[data-lang='id'] g[lang='en']` (dan sebaliknya), lalu cek ulang layar listen. |

## 3. Sebaiknya diperbaiki (tidak memblokir, tetapi melanggar aturan DoD/PRD)

| ID | Keparahan | Temuan | Saran |
|---|---|---|---|
| B-2 | Rendah | `peta-belajar.html:15,20` warna hardcode `#fff` (fallback & `color: #fff`) dan token tidak ada `--radius-lg` (fallback 16 px, bukan skala 12/20/999). Melanggar "tidak ada warna hardcode". | Pakai `var(--color-surface)` / token teks-di-gelap yang ada, dan `--radius-md`. |
| B-3 | Rendah | `landing.html` tidak punya disclaimer wajib §6.1: "StudyKids tidak berafiliasi dengan Cambridge University Press & Assessment." (juga item checklist launch §17.4). | Tambah `<footer>` kecil ID/EN di landing agar desain footer ikut disetujui. |
| B-4 | Rendah (celah test) | `tests/e2e/mockups.spec.ts` hanya mengecek mode ID dan tidak mengecek elemen yang tersembunyi — itulah sebab B-1 lolos. | Tambah satu assert: semua `button`/`a` di `main` terlihat (atau jalankan juga di mode EN). |

## 4. Rekomendasi (tidak memblokir)

1. `paywall.html`: harga coret normal hanya di paket bulanan; tahunan tidak menampilkan Rp1.000.000 coret. Isi kartu paket bergeser ±60 px ke kanan di 360 px (ruang ✓) — tampak janggal; rapikan bila Bimo setuju.
2. `admin-penjualan.html` catatan desain: MRR "dihitung dari `orders` paid" dan rumus 63×50k + 8×100k mengabaikan paket tahunan (seharusnya ÷12 dan dari langganan aktif). Koreksi catatan agar tidak terbawa ke Fase 5.
3. `mockup.js` tidak mengubah `<html lang>` saat beralih ke EN (pembaca layar tetap memakai suara ID). Cukup ditangani di sistem i18n Fase 2.
4. `deploy-pages.yml` masih `actions/setup-node@v4` sementara `ci.yml` sudah v7 — samakan saat sempat.
5. Ikon di mockup memakai emoji sistem (🔒🔊⭐🔥) yang tampil beda per HP; putuskan set ikon SVG di Fase 2.
6. Di luar scope, tidak memblokir: `mysql` belum ada di PATH sampai Claude Desktop di-restart; mojibake `â€”` di `docs/setup/BOOTSTRAP.md`.
7. Keputusan terbuka untuk Bimo di B11: warna English `#7C3AED` (CR kecil di Fase 2 bila setuju). Status hak cipta aset buatan AI perlu dipastikan Bimo sebelum komersial (`ASSET_LICENSES.md`).

## 5. Verdict

**Belum siap** — perbaiki B-1 (disarankan sekaligus B-2, B-3, B-4), jalankan ulang `npm run test:e2e` + `npm run check`, lalu Bimo melakukan B11 (review galeri `https://medirty.github.io/studykidsapp/mockups/`, tulis persetujuan/revisi, putuskan warna English). Setelah itu Bimo menulis "Fase 1 disetujui" → tag `phase-1-approved`.
