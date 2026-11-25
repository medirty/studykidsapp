# Rencana Fase 2 — Fondasi Frontend

Sumber: PRD §14 (baris Fase 2), §8.1, §8.2, §8.5, §8.6, §9.1–9.3, §10.1–10.2, §11, §12.2, FR-1, FR-2, FR-3, FR-7, FR-8; ADR D-005; komponen di `docs/mockups/README.md`; catatan gate Fase 1 (`docs/plans/gate-phase-1.md`).
Dibuat: 25 Nov 2026 lewat `/plan-phase`. Checklist ringkas ada di `docs/PROGRESS.md`.

## Exit Criteria (PRD §14)

| # | Kriteria | Dibuktikan oleh task |
|---|---|---|
| E1 | Unit test komponen UI lolos (Vitest + Testing Library) | T2.1, T2.4, T2.5, T2.8 |
| E2 | Lighthouse mobile ≥ 90 (Performance; Landing juga SEO ≥ 95, FR-1) | T2.10, T2.11 |
| E3 | i18n test lolos: setiap key ada di ID & EN, tanpa teks hardcode di komponen (FR-3) | T2.2 |
| E4 | Install PWA berfungsi (manifest + ikon + service worker, offline shell, prompt update) | T2.9 |

## Batas scope Fase 2

- **Masuk:** komponen UI dasar, ikon & avatar, i18n reaktif, routing + app shell, Dexie + store + `api.ts` adapter lokal, speech wrapper, PWA, layar yang tidak butuh engine (landing, pilih kelas/profil, beranda) dalam mode lokal.
- **Fase 3 (bukan sekarang):** komponen soal `components/question/*`, peta belajar berisi konten, sesi, feedback, ringkasan, mini game — semuanya bergantung pada bentuk data engine & konten.
- **Fase 4:** pengiriman antrian ke `POST /api/sync`, akun ortu, Parent Gate sungguhan. Di Fase 2 antrian event hanya disimpan lokal.
- Layar mengikuti mockup Fase 1 yang sudah disetujui (B11). Perubahan tampilan besar = wajib tanya Bimo (§17.5).

## Aturan umum Fase 2

- TDD untuk `services/` & `lib/` (logika murni); komponen diuji dengan Testing Library (render, label/role, interaksi, ✓/✗ bukan warna saja).
- Semua teks lewat i18n, semua warna lewat `tokens.css`, nama brand lewat `brand.config.ts`, harga lokal dari config (bukan hardcode di komponen).
- Dependency hanya yang ada di D-005; tambahan (DOM test env, Testing Library) wajib ADR baru di T2.1.
- Budget §8.1 tetap: JS awal ≤ 120 KB gzip, CSS ≤ 25 KB. Route di luar alur pertama di-lazy-load.
- Setiap layar: E2E 360 & 1280 px tanpa scroll horizontal + axe 0 serius/kritis, `prefers-reduced-motion` dihormati.
- Build Pages memakai `VITE_BASE=/studykidsapp/` + `VITE_API_MODE=local`; jangan hardcode path absolut.

## Task (urut dependensi)

Setiap task = 1 sesi `/next`, 1 branch (`feat/f2-...`), 1 PR.

### T2.0 `[opus]` ADR arsitektur frontend Fase 2
- **PRD:** §10.1, §10.2, §11, §12.2, FR-2, FR-3.
- **Isi:** satu ADR di `DECISIONS.md`: (a) peta route `svelte-spa-router` (hash, mana yang lazy), (b) desain store Svelte 5 (`profile`, `settings`, `entitlement`; runes vs store), (c) skema Dexie v1 (`profiles`, `settings`, `progressEvents` dengan `clientEventId` UUID, `skillMastery`, `syncQueue`) + strategi versi/migrasi Dexie, (d) interface `api.ts` + adapter `local` vs `api`, (e) set ikon (SVG milik sendiri, menggantikan emoji — catatan gate Fase 1 no. 5), (f) DOM test env. Tanpa kode produksi kecuali tipe TS.
- **AC:** ADR mencakup a–f dengan alasan & dampak budget; tipe di `frontend/src/services/types.ts` lolos `npm run check`; skema tidak menyimpan email/HP/foto/lokasi anak (§8.4).

### T2.1 `[sonnet]` Infrastruktur test komponen
- **PRD:** §15.1, D-005 (catatan DOM test env).
- **Isi:** pasang `happy-dom` (atau `jsdom`, sesuai T2.0) + `@testing-library/svelte`; ADR dependency (lisensi, ukuran, dev-only); konfigurasi Vitest per-file (engine tetap `node`).
- **AC:** 1 test komponen contoh lolos; `npm run check` hijau; bundle produksi tidak berubah.

### T2.2 `[sonnet]` i18n reaktif + penjaga teks hardcode
- **PRD:** FR-3, §8.5.
- **Isi:** locale reaktif (ganti bahasa tanpa reload), `<html lang>` ikut berubah (catatan gate no. 3), tersimpan (sementara `localStorage`, pindah ke profil di T2.7), parameter. Test: key ID = key EN, tidak ada nilai kosong; skrip/lint sederhana yang menandai teks literal di markup `.svelte`.
- **AC:** test i18n lolos; mengganti locale memperbarui teks & `lang`; teks literal sengaja → cek gagal.

### T2.3 `[sonnet]` Ikon SVG + komponen Kiko & Avatar + 12 avatar
- **PRD:** FR-2 (12 avatar orisinal), §9.4, §8.5; keputusan Bimo 24 Nov 2026 (12 avatar di Fase 2).
- **Isi:** set ikon SVG kecil (gembok, speaker, bintang, api/streak, ✓, ✗, panah, rumah, pengaturan) sebagai komponen `Icon`; komponen `Kiko` (4 ekspresi dari `docs/brand/kiko/`) & `Avatar`; tambah 8 avatar baru (total 12), gaya sama dengan 4 contoh. Lisensi di `ASSET_LICENSES.md`.
- **AC:** tiap SVG ≤ 6 KB, tanpa `<text>`/`<script>`; ikon dekoratif `aria-hidden`, ikon bermakna punya label i18n; test render; galeri `docs/brand/index.html` memuat 12 avatar.

### T2.4 `[sonnet]` Komponen UI dasar
- **PRD:** §9.1, §9.2, §8.5; daftar komponen `docs/mockups/README.md`.
- **Isi:** `Button` (primer/sekunder, ukuran ≥ 72 px untuk kelas 1–2), `Card`, `Chip` (status ikon+teks), `ProgressBar`, `Stars`, `Modal` (fokus terjebak, Esc, kembali fokus), `SubjectCard` (warna mapel dari token).
- **AC:** unit test tiap komponen (role, label, state disabled/selected, ✓ + border bukan warna saja, Modal keyboard); target sentuh ≥ 48 px; tanpa hex di komponen.

### T2.5 `[sonnet]` Routing + app shell
- **PRD:** §10.1, §9.1 no. 5, §17.5 (base path).
- **Isi:** `svelte-spa-router` sesuai peta route T2.0; `AppHeader` (logo, toggle ID/EN); halaman kerangka + 404 ramah; route berat lazy; ganti hello-world di `App.svelte` (status API tetap di mode dev).
- **AC:** E2E navigasi antar-route & tombol back; jalan di build `VITE_BASE=/studykidsapp/`; JS awal tetap dalam budget (angka dicatat).

### T2.6 `[opus]` Lapisan data lokal: Dexie + `api.ts` adapter lokal + antrian event
- **PRD:** §12.2, §10.2 (mode lokal), §8.2, FR-2 (merge progress tanpa duplikat), ADR T2.0.
- **Isi:** `services/db.ts` (skema v1), `services/api.ts` (interface + adapter `local`; adapter `api` = stub Fase 4), `services/sync.ts` (enqueue event dengan `clientEventId`, idempoten; pengiriman = Fase 4). Dexie di-import dinamis bila budget mepet.
- **AC:** TDD dengan IndexedDB tiruan (mis. `fake-indexeddb`, ADR bila dipasang): CRUD profil, event ganda dengan `clientEventId` sama tidak terduplikasi, data bertahan setelah reload (E2E); tidak ada request jaringan di mode `local`.

### T2.7 `[sonnet]` Store profil & pengaturan
- **PRD:** FR-2, FR-3 (bahasa per profil), FR-8 (setting baca otomatis), ADR T2.0.
- **Isi:** store `profile` (aktif, daftar), `settings` (locale, baca otomatis, kurangi animasi), `entitlement` (lokal = demo); locale pindah dari `localStorage` ke profil aktif.
- **AC:** unit test store (ganti profil → locale ikut, setting tersimpan di Dexie); `entitlement` lokal selalu demo dengan `demo.unit_limit` dari config.

### T2.8 `[sonnet]` Speech wrapper + tombol 🔊
- **PRD:** FR-8, §8.6.
- **Isi:** `services/speech.ts` (TTS `speechSynthesis`, pilih suara `id-ID`/`en-US`/`en-GB`, fallback suara default + pesan ramah, deteksi `SpeechRecognition` → sembunyikan bila tidak ada); komponen `SpeakButton`.
- **AC:** TDD dengan `speechSynthesis` tiruan: pilih suara sesuai bahasa, fallback memicu pesan i18n, API tidak ada → tombol tersembunyi tanpa error; tidak ada request jaringan.

### T2.9 `[sonnet]` PWA: manifest, service worker, prompt update
- **PRD:** §8.2, §9.4 (ikon PWA dari `docs/brand/`), D-005.
- **Isi:** `vite-plugin-pwa` (generateSW), manifest (nama dari `brand.config.ts`, ikon 192/512/maskable, warna dari token), precache shell + font, prompt "Versi baru tersedia — muat ulang" (tidak memaksa); scope/start_url benar untuk `/studykidsapp/`.
- **AC:** Lighthouse/Chrome menyatakan installable; E2E: SW terdaftar, app terbuka offline setelah kunjungan pertama; prompt update tampil saat SW baru menunggu (test unit/komponen); bukti install di HP/desktop dicatat (screenshot tanpa data anak).

### T2.10 `[sonnet]` Layar Landing dari mockup
- **PRD:** FR-1, §8.1, mockup `landing.html`.
- **Isi:** landing nyata (hero Kiko, keunggulan, 8 mapel, soal contoh tap statis, harga dari config di mode lokal, FAQ, CTA "Coba Gratis"); meta SEO ID/EN.
- **AC:** "Coba Gratis" → pilih kelas ≤ 2 klik; Lighthouse mobile Performance ≥ 90 & SEO ≥ 95; E2E 360/1280 + axe bersih.

### T2.11 `[sonnet]` Layar Pilih kelas/profil + Beranda (mode lokal)
- **PRD:** FR-2, FR-7, §9.1, mockup `pilih-kelas.html`, `beranda.html`, `beranda-besar.html`.
- **Isi:** buat profil lokal (nama panggilan, kelas 1–6, 12 avatar; PIN = Fase 4), pilih profil, beranda varian kelas 1–2 & 5–6 (mapel, streak positif, "lanjutkan belajar" kosong/placeholder sampai Fase 3).
- **AC:** E2E: buka app → mulai belajar ≤ 3 tap; profil bertahan setelah reload; Lighthouse ≥ 90 di beranda; tanpa email/HP anak.

### T2.12 `[sonnet]` Verifikasi akhir Fase 2 di Pages
- **PRD:** §14 Exit Criteria Fase 2, §17.5.
- **Isi:** deploy Pages, cek route/aset/SW di `/studykidsapp/`, install PWA, ukur JS/CSS awal, rangkum bukti E1–E4 di `PROGRESS.md`. Sisa kecil gate Fase 1: `setup-node@v4` di `deploy-pages.yml`.
- **AC:** tabel bukti E1–E4 lengkap; `npm run check`, `test:e2e`, Lighthouse hijau di CI.

### Gate `[opus]` `/gate` → Bimo menulis "Fase 2 disetujui" → tag `phase-2-approved`

## Default yang dipakai (bisa diubah Bimo)

1. Komponen soal (`Mcq`, `Input`, dll.) dikerjakan di **Fase 3** bersama engine, karena bentuk datanya ditentukan engine.
2. Ikon memakai **SVG buatan sendiri** (tanpa library ikon baru), menggantikan emoji di mockup.
