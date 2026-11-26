# Gate Fase 2 — Fondasi Frontend (laporan reviewer, run ke-2)

- **Tanggal:** 26 Nov 2026 · **Branch:** `main` @ `2260e6a` (tree bersih) · **Reviewer:** subagent `reviewer`
- **Acuan:** PRD §14 baris Fase 2 ("Unit test komponen; Lighthouse ≥ 90; i18n test lolos; install PWA berfungsi"), §8.1, §15.1–15.2, FR-3; `docs/plans/phase-2.md` E1–E4.
- Laporan ini **tidak** menyetujui fase. Hanya Bimo yang boleh menulis "Fase 2 disetujui".

## Riwayat

Run pertama (26 Nov 2026, branch `feat/f2-verifikasi-akhir` @ `3c20570`) → **Belum siap**:
- **B-1** pilihan bahasa header tidak tersimpan ke profil/perangkat → diperbaiki di PR #70 (`97c3444`): `AppHeader` memanggil `settings.setLocale`; E2E "bahasa pilihan bertahan setelah reload (tanpa dan dengan profil)".
- **B-2** job `lighthouse` CI merah (Perf 0,72 / 0,88) → PR #71 (`6b2f5e3`): `numberOfRuns: 3` + `VITE_API_MODE=local` di job lighthouse.
- **B-3** T2.12 belum di `main` → PR #69 (`2260e6a`) di-merge.

Ketiganya diverifikasi ulang dari nol di bawah.

## 1. Hasil per Exit Criterion

| # | Kriteria | Status | Bukti |
|---|---|---|---|
| E1 | Unit test komponen lolos | ✓ | `npm run check` → vitest **15 file, 84/84 lolos** (komponen UI, media, shell, UpdatePrompt, Landing, Start). |
| E2 | Lighthouse ≥ 90 (mobile) | ✓ | **CI main hijau 2 run berturut-turut** setelah #71 (`45770254503`, `45770699113`: lighthouse ✓ "3 total run(s)", assertion lolos). **Lokal reviewer** (`@lhci/cli@0.16 collect`, mobile, build `VITE_API_MODE=local`, 3 run): Landing Perf **1/1/1**, A11y 1, BP 0,96, SEO 1, LCP 1,09–1,13 s, CLS ≤ 0,003. **Beranda `#/home` dengan profil** (puppeteerScript membuat profil, `disableStorageReset`; laporan memuat "Ganti profil", ikon gembok mapel): Perf **1/1/0,99**, A11y 1, BP 1, SEO 1. |
| E3 | i18n test lolos | ✓ | `i18n.test.ts` lolos (key ID=EN, tanpa nilai kosong, locale reaktif + `<html lang>`, penjaga teks literal `.svelte`). B-1 **terverifikasi tertutup**: E2E `profile.spec.ts:44` lolos di 3 project; manual reviewer @360 px: profil "Ayu" → tombol header → EN → reload → "Hi, Ayu!", `html[lang=en]`. |
| E4 | Install PWA berfungsi | ✓ (otomatis) | E2E `pwa.spec.ts` lolos 3 project (manifest valid, SW mengontrol halaman, shell terbuka offline). Pages: `/studykidsapp/`, `manifest.webmanifest`, `sw.js`, `icons/icon-192.png`, `robots.txt`, `mockups/` → **200**; manifest `start_url "."`, `scope "."`, 3 ikon termasuk maskable, `display standalone`. Install di HP/desktop nyata: tindakan Bimo (lihat §4). |

### Perintah yang dijalankan (hasil nyata)

| Perintah | Hasil |
|---|---|
| `npm run check` | eslint + prettier "All matched files use Prettier code style!"; `svelte-check` **325 FILES 0 ERRORS 0 WARNINGS**; vitest **84 passed (84)**; build OK; `JS awal : 34.36 KB gzip (batas 120.00 KB)`, `CSS awal: 2.32 KB gzip (batas 25.00 KB)` → **Budget OK**. Chunk `db` (Dexie) 31,60 KB gzip terpisah. Peringatan Vite `configLoader: 'native'` (tidak memblokir). |
| `npm run build` | Termasuk dalam `check`; PWA `generateSW`, precache 17 entri. |
| `npm run test:e2e` | **174 passed, 288 skipped** (36,5 s). Skip = mockup hanya di project desktop (by design). Log `ECONNREFUSED /api/health` karena API PHP tidak jalan; tidak memengaruhi hasil. |
| `gh run list --branch main --limit 8` | CI `2260e6a` (#69) **success** (frontend, lighthouse, backend 8.2, backend 8.4); CI `6b2f5e3` (#71) **success**; CI `97c3444` (#70) failure — lighthouse `found 0.88` dengan "1 total run(s)" (sebelum #71); CI #68 failure (sebelum fix). Deploy Pages: 4 run terakhir success. |
| `gh pr list` | Tidak ada PR terbuka. |
| `npm audit --omit=dev` | `found 0 vulnerabilities` |
| Backend | `git diff phase-1-approved..HEAD -- backend` kosong → backend tidak disentuh di Fase 2; job CI backend (php 8.2/8.4, MariaDB 11.8) hijau. `composer test` lokal tidak dijalankan (tidak relevan; `mysql` di PATH tidak dibutuhkan). |
| Chrome DevTools @ **360×740** mobile | Landing, Start, Beranda: `scrollWidth = 360` (tanpa scroll horizontal). Screenshot Beranda kelas 1 dicek: kartu mapel 88–98 px, gembok = ikon + teks. |

## 2. Keamanan (security-review, scope Fase 2)

Auth, pembayaran, webhook, IDOR, CSRF, brute force, 2FA admin, race kuota early bird: **belum ada kodenya** (Fase 4/6) — N/A. Dicek:

- **Data anak:** `Profile` = id, serverId, nickname (1–20), grade, avatarId (bawaan), locale, prefs, waktu. Tanpa email/HP/foto/lokasi. ✓
- **XSS:** grep `{@html|innerHTML|eval(|new Function` di `frontend/src` → 0. ✓
- **Pelacak pihak ketiga:** satu-satunya URL di `frontend/src` adalah `http://www.w3.org/2000/svg` (namespace SVG). Tidak ada script/font eksternal. ✓
- **Storage lokal:** `localStorage` hanya `sk.locale` (diverifikasi: `{"sk.locale":"en"}`); data profil di IndexedDB. ✓
- **console.log:** 0 di `frontend/src`. ✓
- **Secret:** tidak ada pola secret baru; dependency prod 0 vulnerability. ✓
- **CSP:** belum ada (Pages tidak bisa set header) — tetap catatan Fase 4/7.

Tidak ada temuan keamanan tinggi/sedang.

## 3. Temuan

### Blocker
Tidak ada.

### Major
Tidak ada.

### Minor (tidak memblokir)

| ID | Temuan | Saran perbaikan |
|---|---|---|
| L-1 (lama, terbuka) | Warna di luar token: `components/ui/Modal.svelte:61` `rgb(27 19 64 / 60%)`; test "tanpa hex" tidak menangkap `rgb()`. | Token `--color-overlay` di `tokens.css`; perluas test ke `rgb(`/`hsl(`. |
| L-2 (lama, terbuka) | `/studykidsapp/favicon.ico` → **404** di Pages (dicek ulang); console error di Landing → BP 0,96. | `<link rel="icon" href="favicon.svg" type="image/svg+xml">` (relatif) di `index.html`. |
| L-3 (lama, terbuka) | Tidak ada project E2E 360 px untuk layar app (Pixel 5 = 393, iPhone 12 = 390). Reviewer cek manual: 360 OK. | Tambah project `mobile-360` atau `setViewportSize` di spec landing/profile. |
| L-5 (lama, terbuka) | Beranda: "Free · Units 1–2" menggantung di luar kartu mapel, sedangkan "Locked" di dalam kartu (terlihat di screenshot 360 px). | Pindahkan badge ke dalam `SubjectCard`. |
| L-6 (lama, terbuka) | Belum ada pesan bila `profile.failed` di Beranda/Landing. | Status loading/gagal di store + pesan i18n. |
| L-7 (baru) | `document.title` hanya di-set di `Landing.svelte:38`. Setelah ganti ke EN dan reload di Beranda, `<html lang=en>` tetapi judul tab tetap "StudyKids — Belajar SD seru bareng Kiko". | Set title per route (atau di `App.svelte` dari `t()` reaktif). |
| L-8 (baru) | `settings.setLocale` memanggil `setLocale` i18n **setelah** `await` ke Dexie. Bila IndexedDB gagal (mode privat/terblokir), tombol ID/EN tidak berubah sama sekali dan muncul unhandled rejection dari `AppHeader`. | Ubah UI dulu (`setLocale(locale)` sebelum write) atau `try/catch` di toggle. Tambah 1 unit test api yang menolak. |
| L-9 (baru) | Lighthouse CI: (a) `numberOfRuns: 3` tanpa `aggregationMethod` → LHCI memakai default **optimistic** (run terbaik), bukan median seperti saran run pertama; (b) hanya URL Landing; (c) tidak ada assertion `categories:accessibility`. Angka sekarang tetap jauh di atas ambang, jadi tidak memblokir. | `"aggregationMethod": "median-run"` di assertion; tambah `categories:accessibility` ≥ 0,9; Beranda via `puppeteerScript` (contoh berhasil dipakai reviewer). |
| L-4 (lama) | Baris status API dev tampil bila `VITE_API_MODE !== 'local'`. | Batasi ke `import.meta.env.DEV` (Fase 4). |

### Ponytail-review (perubahan sejak run pertama + kualitas Fase 2)

- **#70 (B-1):** fix 1 baris di akar masalah (`AppHeader` → store), test komponen disesuaikan, E2E reload ditambah. Kecil & tepat. Celah: jalur gagal storage (L-8).
- **#71 (B-2):** 2 baris konfigurasi, tanpa menurunkan ambang. Lihat L-9 tentang agregasi.
- **#69 (T2.12):** hanya docs + `setup-node@v7`.
- Temuan duplikasi lama masih berlaku (tidak memblokir): daftar 8 mapel + fallback demo di `Landing.svelte` & `Home.svelte`; dua file test i18n tumpang tindih; sisa `hello.*`/`smoke.spec` Fase 0; `profiles.onActiveChange` di-set dari konstruktor `SettingsStore` (satu callback, kopling tersembunyi).

## 4. Butir terbuka untuk Bimo (bukan blocker kode)

| Butir | Status |
|---|---|
| Install PWA di HP/desktop nyata | Belum dicatat. Buka `https://medirty.github.io/studykidsapp/` di Chrome HP → menu ⋮ → "Tambahkan ke layar utama" / "Instal aplikasi". |
| 8 avatar baru (T2.3) | Masih menunggu persetujuan visual di `docs/brand/index.html`. |
| ADR D-011 | Status "diusulkan" → ubah ke "disetujui" bila Bimo setuju. |
| B1 domain `studykids.id` | Masih terbuka; tidak menghalangi gate. |

## 5. Verdict

**Siap untuk persetujuan Bimo.**

Keempat Exit Criteria terpenuhi dengan bukti; B-1, B-2, B-3 tertutup; CI `main` hijau di semua job. Minor L-1…L-9 boleh dikerjakan sebagai task kecil (disarankan sebelum/awal Fase 3: L-2, L-7, L-8, L-9). Sebelum menulis "Fase 2 disetujui", Bimo sebaiknya mencoba install PWA di HP dan menyetujui 8 avatar.
