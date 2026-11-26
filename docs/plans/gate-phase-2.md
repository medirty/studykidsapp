# Gate Fase 2 — Fondasi Frontend (laporan reviewer)

- **Tanggal:** 26 Nov 2026 · **Branch:** `feat/f2-verifikasi-akhir` @ `3c20570` (tree bersih) · **Reviewer:** subagent `reviewer`
- **Acuan:** PRD §14 baris Fase 2 ("Unit test komponen; Lighthouse ≥ 90; i18n test lolos; install PWA berfungsi"), §8.1, §8.4, §15.1–15.2, FR-1, FR-2, FR-3, FR-7; `docs/plans/phase-2.md` E1–E4.
- Laporan ini **tidak** menyetujui fase. Hanya Bimo yang boleh menulis "Fase 2 disetujui".
- **Status branch:** commit T2.12 (`3c20570`) **belum ada di `main`** — PR #69 masih OPEN dan CI-nya **gagal** (job `lighthouse`). Tidak di-merge oleh reviewer.

## 1. Hasil per Exit Criterion

| # | Kriteria | Status | Bukti |
|---|---|---|---|
| E1 | Unit test komponen UI lolos | ✓ | `npm run check`: vitest **15 file, 84/84 lolos**. Test komponen: `ui.component.test.ts` (12: Button, Card, Chip, ProgressBar, Stars, Modal keyboard, SubjectCard), `media.component.test.ts` (7: Icon/Kiko/Avatar/SpeakButton), `UpdatePrompt`, `shell`, `Landing` (2), `Start` (1). Catatan: `Home.svelte` hanya diuji E2E. |
| E2 | Lighthouse ≥ 90 (mobile; Landing SEO ≥ 95) | ✗ (CI merah) | **Lokal** (lighthouse 12, mobile 412 px, build preview), 3× Landing: Perf **0,98/0,98/0,98**, A11y 1, BP 0,96, SEO 1, LCP ≈ 2,0 s. Beranda (`#/home` dengan profil tersimpan, 2×): Perf **0,98**, A11y 1, SEO 1. **Pages** `https://medirty.github.io/studykidsapp/`: Perf 0,99, A11y 1, BP 0,96, SEO 1. **Tetapi CI (Lighthouse CI, gate otomatis §15.1) gagal**: `main` run `45758038107` (merge #68) → `categories.performance found 0.72`; PR #69 run `45764386130` → `found 0.88`. 2 dari 3 run terakhir merah. CI `main` merah sejak T2.11. |
| E3 | i18n test lolos (key ID = EN, tanpa teks hardcode) | ✓ dengan bug | `i18n.test.ts` lolos: key ID=EN, tanpa nilai kosong, locale reaktif + `<html lang>`, penjaga teks literal di semua `.svelte` (0 temuan). Grep atribut `aria-label/alt/title/placeholder` literal → 0. **Namun** pilihan bahasa dari tombol ID/EN **tidak bertahan** setelah reload (bug B-1, direproduksi). |
| E4 | Install PWA berfungsi | ✓ (otomatis), perangkat nyata belum | E2E `pwa.spec.ts` lolos di 3 project (manifest, SW mengontrol halaman, shell terbuka offline). Reviewer via CDP `Page.getInstallabilityErrors` → **`[]`** di Pages dan lokal; `Page.getAppManifest` errors `[]`; SW controller aktif. Pages: `manifest.webmanifest`, `sw.js`, `icons/icon-192.png`, `robots.txt` → 200; manifest `start_url/scope "."`, 3 ikon termasuk maskable. **Install di HP/desktop nyata belum dicatat** (tindakan Bimo, lihat §4). |

### Perintah yang dijalankan (hasil nyata)

| Perintah | Hasil |
|---|---|
| `npm run check` | eslint + prettier bersih; `svelte-check` **325 file, 0 error, 0 warning**; vitest **84/84**; build OK; **JS awal 34,38 KB gzip** (batas 120), **CSS 2,32 KB** (batas 25) → "Budget OK". Chunk `db` (Dexie) 31,60 KB gzip terpisah. Peringatan Vite `configLoader: 'native'` (import tanpa ekstensi di `vite.config.ts`), tidak memblokir. |
| `npm run test:e2e` | **171 passed, 288 skipped** (49,4 s). Skip = mockup hanya di project desktop (by design). Log `ECONNREFUSED /api/health` karena API PHP tidak jalan; tidak memengaruhi hasil. |
| `npm run test:api` (PHP 8.4, MariaDB service RUNNING) | **OK (5 tests, 17 assertions)** |
| `npm run lint:api` | phpstan OK; php-cs-fixer **0 dari 12 file** perlu diperbaiki |
| `npm run test:scripts` | 24/24 lolos |
| `npm audit --omit=dev` | 0 vulnerabilities |
| `gh run list` (CI `main`) | T2.2–T2.10 success; **#68 (T2.11) failure — job `lighthouse` saja** (frontend, backend 8.2/8.4 success). Deploy Pages: 8 run terakhir success. |
| `gh pr list` | #69 (T2.12) **OPEN**, CI failure (lighthouse 0,88). Tidak ada PR Dependabot terbuka. |
| Playwright reviewer @ **360×740** (Landing, Pilih kelas, Beranda) | `scrollWidth = 360` di ketiganya (tanpa scroll horizontal); screenshot dicek visual — layout rapi, target sentuh besar kelas 1. |
| CDP installability (Pages + lokal) | `installabilityErrors: []`, `manifest errors: []`, `controller: true` |

## 2. Keamanan (security-review, scope Fase 2)

Auth, pembayaran, webhook, IDOR, CSRF, kuota early bird **belum ada kodenya** (Fase 4/6). Yang dicek:

- **Data anak (§8.4):** `Profile` = id, serverId, nickname (1–20, divalidasi), grade (1–6), avatarId (bawaan), locale, prefs, waktu. `cleanProfile` di `services/api.ts` hanya menyalin field yang dideklarasikan. Tidak ada email/HP/foto/lokasi. ✓
- **XSS:** tidak ada `{@html}`, `innerHTML`, `eval`, `new Function` di `frontend/src`. Nickname dirender sebagai teks. ✓
- **Pelacak pihak ketiga:** tidak ada URL eksternal di `frontend/src`/`index.html`; font & ikon lokal; request jaringan Landing hanya aset sendiri. ✓
- **Secret:** `git ls-files` hanya `.env.example` & `backend/.env.example`; `.env*` di `.gitignore`; tidak ada pola secret di kode (temuan grep hanya `TOKEN` lokal di skill `.claude/skills/impeccable`, bukan secret). ✓
- **Service worker:** `registerType: 'prompt'` (tidak memaksa), precache aset sendiri, `navigateFallback: index.html`, hanya di produksi. ✓
- **CSP:** belum ada (Pages tidak bisa set header; meta CSP juga belum). Catat untuk Fase 4/7 di `.htaccess` Hostinger (L-4).
- `localStorage` hanya `sk.locale` (bukan data anak). ✓

Tidak ada temuan keamanan tingkat tinggi/sedang.

## 3. Temuan

### Memblokir

| ID | Keparahan | Temuan | Saran perbaikan |
|---|---|---|---|
| B-1 | **Sedang** | **Pilihan bahasa tidak tersimpan.** `components/AppHeader.svelte:6` memanggil `setLocale` dari `i18n` langsung, bukan `settings.setLocale`. Akibatnya bahasa tidak ditulis ke profil aktif (FR-3 "bahasa per profil") maupun ke `settings.locale` Dexie; saat reload `settings.load()` menimpa dengan nilai lama. Reproduksi reviewer (Playwright): tanpa profil `en → reload → id`; dengan profil di Beranda `Home → reload → Beranda`. Test unit store lolos karena tidak ada test yang menekan tombol header. | Di `AppHeader` panggil `settings.setLocale(...)` (store sudah menangani profil vs perangkat). Tambah 1 E2E: toggle EN → reload → `html[lang=en]` (dengan dan tanpa profil). |
| B-2 | **Sedang** | **CI `main` merah & PR #69 merah** di job `lighthouse` (Perf 0,72 lalu 0,88). Penyebab: (a) `lighthouserc.json` `numberOfRuns: 1` → satu run runner GitHub yang lambat langsung gagal; (b) sejak T2.11 `App.svelte` memanggil `settings.load()` saat start sehingga chunk Dexie (31,6 KB gzip) ikut dimuat di Landing pada jalur render pertama; (c) build CI tanpa `VITE_API_MODE` → Landing memanggil `/api/health` (502) → `errors-in-console`. Lokal & Pages tetap 0,98–0,99, jadi angka produk lolos, tetapi gate otomatis §15.1 ("CI gagal jika terlampaui") merah dan AC T2.12 "Lighthouse hijau di CI" tidak terpenuhi. | `numberOfRuns: 3` (median) dan set `VITE_API_MODE=local` di job lighthouse (atau `--mode`). Pertimbangkan menunda `settings.load()` di Landing (mis. hanya `getSetting('locale')`, atau muat setelah render). Tambah URL Beranda bila memungkinkan. Jangan menurunkan ambang. |
| B-3 | Prosedural | Commit T2.12 belum di `main` (PR #69 OPEN, CI merah). | Merge setelah B-2 hijau. |

### Tidak memblokir

| ID | Keparahan | Temuan | Saran |
|---|---|---|---|
| L-1 | Rendah | Warna di luar `tokens.css`: `Modal.svelte:61` `rgb(27 19 64 / 60%)` (test "tanpa hex" tidak menangkap `rgb()`), `index.html:6` `theme-color #FF6B3D`, `vite.config.ts:32` `background_color '#fff8f2'`, `brand.config.ts` `colors`. Dua yang terakhir tidak bisa pakai CSS var, tapi sebaiknya satu sumber. | Token `--color-overlay`; ambil `background_color` dari `brand.config.ts`; perluas test ke `rgb(`/`hsl(`. |
| L-2 | Rendah | `/favicon.ico` 404 (lokal & Pages) — `public/favicon.svg` ada tapi tidak ada `<link rel="icon">` di `index.html`. Muncul di `errors-in-console` (BP 0,96). | Tambah `<link rel="icon" href="favicon.svg" type="image/svg+xml">` (relatif, bukan `/`). |
| L-3 | Rendah | Viewport 360 px tidak diuji otomatis untuk layar app: project E2E = Pixel 5 (393) & iPhone 12 (390); hanya mockup yang dicek di 360. Reviewer mengecek manual: Landing/Start/Beranda 360 tanpa overflow. | Tambah project `mobile-360` (atau `setViewportSize` 360) di spec landing/profile. |
| L-4 | Rendah | Baris status API dev (`dev.health`) tampil bila `VITE_API_MODE !== 'local'` — termasuk build produksi mode `api` nanti. CSP belum ada. | Batasi ke `import.meta.env.DEV`; CSP di Fase 4/7. |
| L-5 | Rendah | Beranda: catatan "Gratis · Unit 1–2" berada di luar kartu mapel (tampak "menggantung" di 360 px), sementara status terkunci ada di dalam kartu. | Pindahkan badge ke dalam `SubjectCard` agar konsisten (cek mockup `beranda.html`). |
| L-6 | Rendah | Belum ada pesan bila `profile.failed` di Beranda/Landing (hanya di Start). Beranda sempat menampilkan "belum ada profil" sebelum `load()` selesai (kedip). | Status `loading` di store; pesan gagal di Beranda. |

### Ponytail-review (kualitas kode Fase 2)

- **Bagus:** solusi kecil dan konsisten — store runes + factory untuk test, `api.ts` satu gerbang data, Dexie lazy, `recordAndEnqueue` idempoten dalam satu transaksi (dites), SW ditunda idle. Tidak ada dependency di luar ADR D-012/D-013.
- **Duplikasi (hapus/gabung):** daftar 8 mapel + fallback `['math','gp','art']` dan `unitLimit ?? 2` ditulis dua kali (`Landing.svelte`, `Home.svelte`) — angka bisnis demo juga di `public-settings.local.json`. Satu konstanta `SUBJECTS` + baca dari settings saja. Dua file test i18n (`src/i18n/i18n.test.ts` & `tests/unit/i18n.test.ts`) menguji hal yang sama (key ID=EN, parameter). Key `hello.*` & `smoke.spec` "hello-world" adalah sisa Fase 0.
- **Berisiko tanpa test:** toggle bahasa di header (B-1 lolos karena tidak ada test end-to-end-nya); `Home.svelte` tanpa test komponen; `profiles.onActiveChange` di-set dari konstruktor `SettingsStore` (kopling tersembunyi; satu callback, ditimpa diam-diam bila ada store kedua).
- **Shortcut tercatat (diterima):** prompt update dites di komponen, bukan SW nyata; daftar suara kosong = "belum dimuat"; `remoteApi` stub sampai Fase 4.

## 4. Temuan gate lama & butir terbuka untuk Bimo

| ID | Status sekarang |
|---|---|
| M-1 (Fase 0, deploy Pages tidak stabil) | **Tertutup** — `deploy-pages.yml` sudah dipecah `build` → `deploy` (`needs: build`); 8 deploy terakhir success; `setup-node@v7` (T2.12). |
| L-1 (Fase 0, Dependabot #19/#20) | **Tertutup** — tidak ada PR Dependabot terbuka. |
| B1 (domain `studykids.id`) | **Masih terbuka** (`PROGRESS.md` baris 149). Tidak menghalangi gate. |
| Avatar 8 baru (T2.3) | **Menunggu persetujuan visual Bimo** di galeri `docs/brand/index.html`. |
| ADR D-011 | Status masih "diusulkan" — perlu diubah ke "disetujui" bila Bimo setuju. |
| Install PWA di HP/desktop nyata | Belum dicatat; Chrome menyatakan installable (CDP), Bimo cukup coba "Tambahkan ke layar utama" di `https://medirty.github.io/studykidsapp/`. |

## 5. Verdict

**Belum siap** — perbaiki:
1. **B-1** toggle bahasa memakai `settings.setLocale` + E2E toggle→reload.
2. **B-2** job Lighthouse CI hijau (`numberOfRuns: 3`, `VITE_API_MODE=local` di job, kurangi kerja Dexie di jalur render Landing) tanpa menurunkan ambang; CI `main` kembali hijau.
3. **B-3** merge PR #69 setelah CI hijau.

Disarankan sekaligus: L-2 (favicon), L-1 (token overlay), L-3 (project 360 px). Setelah itu jalankan ulang `npm run check`, `npm run test:e2e`, cek CI `main` hijau; Bimo menyetujui 8 avatar, mencoba install PWA di HP, lalu menulis "Fase 2 disetujui" → tag `phase-2-approved`.
