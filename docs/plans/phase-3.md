# Rencana Fase 3 — Engine Soal + Demo

Sumber: PRD §14 (baris Fase 3), §5.1, §6.2–6.5, §8.1, §8.2, §8.5, §9.1–9.2, §10.2, §11, §12.2, §15.1, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9; CR-008 (PRD v1.14, `docs/CHANGE_REQUESTS.md`); temuan gate Fase 2 (`docs/plans/gate-phase-2.md` L-1…L-9).
Dibuat: 26 Nov 2026 lewat `/plan-phase`. Checklist ringkas ada di `docs/PROGRESS.md`.

## Exit Criteria (PRD §14)

| # | Kriteria | Dibuktikan oleh task |
|---|---|---|
| E1 | Generator test: setiap generator ≥ 50 soal unik dari 1.000 percobaan, 100% jawaban lolos validator (bank soal: ≥ 20 item dasar per skill, §6.5); seed sama → soal sama | T3.5, T3.16–T3.21 |
| E2 | E2E: anak menyelesaikan sesi **offline** (coba demo → sesi → ringkasan), progres tersimpan & masuk antrian sinkron | T3.15, T3.25 |
| E3 | Demo dirilis ke GitHub Pages dan diuji Bimo + 3–5 anak | T3.25, B13 |
| E4 | Penyegaran visual CR-008: mockup baru disetujui Bimo, lalu terpasang (token, `data-grade-band`, ubin mapel + ilustrasi, Kiko di Beranda) | T3.2, T3.3, B12, T3.8–T3.11 |

## Batas scope Fase 3

- **Masuk:** CR-008, seeded RNG, session engine (adaptif, anti-repeat, rotasi format, spaced repetition), mastery + bintang + XP, 9 komponen format soal, peta belajar jalur, layar sesi/feedback/ringkasan, konten **3 mapel demo (Math, GP, Art) kelas 1–6**, 2 mini game (Balon Angka, Pola Batik) dengan "dunia", laporan anak ringkas, streak dasar. Semua jalan di mode lokal (IndexedDB), tanpa backend.
- **Konten (default, lihat Pertanyaan no. 1):** per mapel × kelas ada daftar **≥ 4 unit** (judul saja untuk unit 3+, tampil terkunci), unit **1–2** berisi lengkap (≥ 3 skill/unit, ≥ 1 generator/skill). Isi unit 3+ = Fase 5.
- **Fase 4:** kirim antrian ke `POST /api/sync`, akun ortu, Parent Gate, laporan ortu (termasuk versi ringkas demo), paywall/kode aktivasi. CTA "Buka semua materi" di Fase 3 hanya membuka modal info (teks i18n), belum ke paywall.
- **Fase 5:** 5 mapel lain, 5 mini game lain, lencana/level/item avatar, mode instruksi English kelas 1–2 (FR-3).

## Aturan umum Fase 3

- **TDD wajib** untuk `engine/` (rng, generator, session, mastery) — skill `superpowers:test-driven-development`. Coverage `engine/` ≥ 80% (§15.1).
- Konten = JSON di `frontend/src/content/{subject}/g{grade}/u{unit}.json` (§6.4), teks `{ id, en }`, ≤ 15 KB gzip per file (cek otomatis). Soal orisinal, konteks Indonesia, tanpa teks/soal Cambridge (§6.1).
- Setiap layar baru mengikuti mockup yang disetujui (B11 lama, atau B12 untuk layar CR-008). Layar baru: E2E 360 & 1280 px tanpa scroll horizontal + axe 0 serius/kritis, `prefers-reduced-motion`, target sentuh ≥ 48 px (≥ 72 px kelas 1–2), ✓/✗ bukan warna saja.
- Budget §8.1: JS awal ≤ 120 KB gzip; engine, konten, layar sesi, dan tiap mini game = chunk lazy (game ≤ 60 KB gzip). Ilustrasi via `?url`/sprite, bukan inline.
- Dependency baru hanya dengan ADR (lisensi + ukuran).
- Task setelah B12 yang tidak butuh mockup (T3.4–T3.7) boleh dikerjakan sambil menunggu persetujuan Bimo.

## Task (urut dependensi)

Setiap task = 1 sesi `/next`, 1 branch (`feat/f3-...`), 1 PR.

### Blok A — Sisa gate Fase 2

#### T3.0 `[sonnet]` Bersih-bersih gate Fase 2 (L-1, L-2, L-7, L-9 + teks debug)
- **PRD:** §9.2, §8.1, §15.1; gate Fase 2.
- **Isi:** token `--color-overlay` untuk Modal + test "tanpa warna literal" menangkap `rgb(`/`hsl(` (L-1); `<link rel="icon" href="favicon.svg">` relatif (L-2); `document.title` per route dari `t()` (L-7); `lighthouserc.json`: `aggregationMethod: median-run`, `categories:accessibility` ≥ 0,9, URL Beranda via `puppeteerScript` (L-9); baris status API di `Landing.svelte` hanya bila `import.meta.env.DEV`.
- **AC:** test L-1 gagal pada contoh `rgb()` lalu lolos; Pages tanpa 404 favicon; ganti ke EN + reload di Beranda → judul EN; LHCI lokal & CI hijau dengan konfigurasi baru.

#### T3.1 `[sonnet]` Pesan saat penyimpanan gagal (L-6, L-8)
- **PRD:** §8.2, §8.5, FR-3.
- **Isi:** `settings.setLocale` mengubah UI dulu lalu menyimpan (gagal simpan = tidak memblokir); pesan i18n ramah bila `profile.failed` di Landing/Beranda.
- **AC:** unit test api yang menolak → locale tetap berganti, tanpa unhandled rejection; test komponen pesan gagal; ID=EN.

### Blok B — Mockup CR-008 (persetujuan Bimo)

#### T3.2 `[sonnet]` Mockup Beranda + ubin mapel + hero Landing (T-CR8.1)
- **PRD:** §9.1 poin 6, §9.2 token turunan, §9.4; CR-008 jawaban 2–6.
- **Isi:** `docs/mockups/beranda-v2.html` (kelas 1–2) & `beranda-besar-v2.html` (kelas 5–6), ubin mapel penuh warna dengan 8 ilustrasi SVG (tanpa buku/pensil/ABC/bola lampu/apel; English = balon bicara, Science = tabung reaksi/planet), Kiko bereaksi, badge "Gratis" di dalam ubin (L-5); `landing-v2.html` (hanya hero + ubin ceria, harga/FAQ tenang). Ilustrasi di `docs/brand/subject/`, lisensi di `ASSET_LICENSES.md`.
- **AC:** masuk `mockups.spec.ts` (360/1280 + axe bersih); teks di ubin memakai warna teks per mapel (putih Math/English, Ink lainnya); ilustrasi ≥ 3:1 terhadap ubin (dihitung, dicatat di `docs/mockups/README.md`).

#### T3.3 `[sonnet]` Mockup peta jalur + dunia mini game
- **PRD:** FR-4, FR-6, CR-008 (peta jalur, game "dunia").
- **Isi:** `peta-belajar-v2.html` (jalur bersimpul: unit = pulau, skill = simpul; terkunci/tersedia/⭐1–3 = ikon + teks), `game-balon-v2.html` (langit, awan, balon berkilau; jeda selalu terlihat), `game-batik.html` + hasil (lanjutkan pola, alternatif ketuk).
- **AC:** 360/1280 + axe bersih; status tidak hanya warna; `prefers-reduced-motion` dicatat; galeri ditautkan.

#### B12 Bimo menyetujui mockup T3.2–T3.3 (tulis "mockup v2 oke")

### Blok C — Inti engine `[opus]`

#### T3.4 `[opus]` ADR engine soal & konten
- **PRD:** FR-5, FR-6, FR-7, FR-9, §6.2–6.5, §10.2, §12.2; D-011/D-013.
- **Isi:** satu ADR: (a) skema JSON unit/skill/generator + bank soal + unit terkunci (judul saja); (b) kontrak generator (`generate(rng, params, level)` → `Question` per format, `validate(question, answer)`, `fingerprint`); (c) tipe `Question`/`Answer` untuk 9 format; (d) seed `profileId + skillId + sessionCounter` dan penyimpanan counter; (e) level adaptif & petunjuk; (f) anti-repeat 5 sesi + rotasi format + spaced repetition 20% (data di Dexie v2, migrasi dari v1); (g) rumus mastery 0–100 (bobot terbaru + decay), bintang 1–3, XP, streak dengan 1 hari libur/minggu; (h) kontrak mini game → event/mastery/XP, lazy chunk; (i) pemuatan konten (dynamic import per unit, terpisah dari konten Full kelak); (j) kriteria uji bank soal (≥ 20 item dasar, §6.5) vs generator (≥ 50 unik); (k) coverage `engine/` (dependency + ADR bila perlu).
- **AC:** ADR mencakup a–k dengan alasan & dampak budget; tipe TS di `engine/types.ts` lolos `npm run check`; tanpa data pribadi anak di event (§8.4).

#### T3.5 `[opus]` `rng.ts` + registry generator + harness uji + loader konten
- **PRD:** FR-5 aturan 1–2 & 4, AC FR-5, §6.4, §8.1 (15 KB/unit), §15.1.
- **Isi:** seeded RNG, fingerprint, registry generator, harness (1.000 percobaan → ≥ 50 unik, semua lolos validator; bank ≥ 20 item), generator contoh `arith.add` (distraktor dari kesalahan umum) dan `bank` generik (acak urutan/pilihan); loader konten + validasi skema semua JSON di test; aturan 15 KB gzip per unit aktif di `check-bundle-size`; contoh `content/math/g1/u1.json`.
- **AC:** TDD; seed sama → soal sama; harness otomatis menjalankan **semua** skill di `content/` (konten baru langsung teruji); coverage `engine/` ≥ 80%; JS awal tidak naik (engine lazy).

#### T3.6 `[opus]` `mastery.ts` + bintang, XP, streak
- **PRD:** FR-9 (rumus terdokumentasi), FR-7, §12.2.
- **Isi:** fungsi murni mastery (bobot terbaru, decay waktu), bintang skill, XP sesi, streak harian dengan 1 hari libur/minggu; dokumentasi rumus di `docs/` (dirujuk ADR); dipakai `recordAndEnqueue` untuk update mastery lokal.
- **AC:** TDD dengan tabel kasus (termasuk batas 0/100, decay, < 10 soal → "data belum cukup"); tidak ada keadaan "streak hilang" bernada negatif.

#### T3.7 `[opus]` `session.ts`: sesi, adaptif, anti-repeat, spaced repetition
- **PRD:** FR-5 aturan 1–6, alur sesi, AC offline; §12.2.
- **Isi:** buat sesi 8–10 soal, rotasi format (≤ 3 berurutan sama), level naik/turun + petunjuk, anti-repeat 5 sesi per skill, 20% soal dari skill lama yang menurun, counter sesi; Dexie v2 (riwayat fingerprint) + migrasi v1→v2 teruji; tiap jawaban → `recordAndEnqueue`.
- **AC:** TDD (deterministik dengan seed, anti-repeat lintas 5 sesi, rotasi, adaptif, 20%); test migrasi Dexie dengan data v1; semua offline.

### Blok D — Penyegaran visual CR-008 (setelah B12)

#### T3.8 `[sonnet]` Token tint + teks per mapel (T-CR8.2)
- **PRD:** §9.2 token turunan, §8.5.
- **Isi:** token tint & teks per mapel di `tokens.css` + `docs/brand/tokens.md`; token lama tidak diubah.
- **AC:** `contrast.test.ts` diperluas: teks per mapel ≥ 4,5:1, ink-soft tidak dipakai di atas warna < 4,5:1, ilustrasi ≥ 3:1.

#### T3.9 `[sonnet]` `data-grade-band` dari profil aktif (T-CR8.3)
- **PRD:** §9.1 poin 2 & 6.
- **Isi:** atribut `data-grade-band` di root app dari `profile.active.grade`; ganti `class:big` di `Home.svelte` ke aturan band.
- **AC:** test komponen: kelas 1–2 / 3–4 / 5–6 → atribut benar, berubah saat ganti profil.

#### T3.10 `[sonnet]` `SubjectCard` ubin penuh + 8 ilustrasi + suara (T-CR8.4, L-5, L-3)
- **PRD:** §9.1 poin 6, §9.4, FR-8, §8.1 (gambar ≤ 50 KB, lazy).
- **Isi:** ubin sesuai mockup B12, ilustrasi via `?url`/sprite, badge "Gratis" di dalam ubin, ketuk ubin di kelas 1–2 membacakan nama mapel (progressive enhancement); project/viewport E2E 360 px untuk layar app.
- **AC:** test komponen (label, suara dipanggil hanya kelas 1–2, tanpa error bila speech tak ada); E2E 360 px tanpa scroll horizontal + axe; JS awal naik ≤ 5 KB (angka dicatat).

#### T3.11 `[sonnet]` Kiko di Beranda + Landing hero/ubin gaya baru (T-CR8.5)
- **PRD:** §9.1 poin 6, FR-1 (Lighthouse ≥ 90, SEO ≥ 95).
- **Isi:** Kiko bereaksi saat disentuh (ganti ekspresi/animasi kecil, `prefers-reduced-motion`), latar bagian `sunny`/`teal`/`bubblegum`; Landing hanya hero + ubin.
- **AC:** test komponen reaksi + reduced-motion; Lighthouse Landing & Beranda tetap ≥ 90 (SEO Landing ≥ 95).

### Blok E — Layar belajar

#### T3.12 `[sonnet]` Komponen soal 1: `Mcq`, `Input`, `Tf`, `Tap`, `Listen`
- **PRD:** FR-5 format, FR-8, §8.5; mockup `soal-*.html`.
- **Isi:** komponen di `components/question/` memakai tipe `Question` T3.4; keypad angka; 🔊 di instruksi & soal (otomatis dibaca bila setting aktif); `Listen` dengan pesan ramah bila suara tak ada.
- **AC:** test komponen tiap format (role/label, pilih → jawaban terkirim, terpilih = ✓ + border, keyboard); ID=EN.

#### T3.13 `[sonnet]` Komponen soal 2: `DragDrop`, `Match`, `Order`, `Draw`
- **PRD:** FR-5 format, §8.5; mockup `soal-dragdrop|match|order|draw.html`.
- **Isi:** seret + alternatif ketuk-untuk-pilih (aksesibel tanpa drag), `Draw` kanvas (tidak dinilai, tombol Selesai), tanpa dependency drag baru.
- **AC:** test komponen jalur ketuk & keyboard; `Draw` menghasilkan jawaban "selesai"; E2E sentuh di project mobile.

#### T3.14 `[sonnet]` Peta belajar jalur (FR-4)
- **PRD:** FR-4, §5.1 (unit 1–2 terbuka), mockup `peta-belajar-v2.html` (B12).
- **Isi:** route lazy `#/map/:subject`, unit = pulau, skill = simpul (terkunci/tersedia/⭐), unit 3+ gembok + CTA "Buka semua materi" (modal info Fase 3), mapel non-demo terkunci.
- **AC:** tampil < 1 s setelah navigasi (diukur di E2E), scroll lancar; Beranda → mapel → peta ≤ 2 tap; status = ikon + teks.

#### T3.15 `[sonnet]` Layar sesi + feedback + ringkasan
- **PRD:** FR-5 alur & feedback, FR-7, FR-8; mockup `feedback-*.html`, `ringkasan.html`.
- **Isi:** route lazy `#/session/:skillId` memakai `session.ts`; feedback benar (Kiko + XP + suara singkat), salah (jawaban benar + `explain` + 🔊, tanpa nyawa); ringkasan (bintang, XP, skill naik/turun positif); "Lanjut belajar" di Beranda menuju skill terakhir.
- **AC:** E2E: coba demo → sesi 8–10 soal → ringkasan, **dalam mode offline** (`context.setOffline`) dan progres bertahan setelah reload; antrian sinkron berisi event; 360/1280 + axe.

### Blok F — Konten demo (pola dari T3.5; harness otomatis menguji semua)

Tiap task: unit 1–4 per kelas (judul unit 3–4 saja), unit 1–2 lengkap ≥ 3 skill, teks ID/EN orisinal konteks Indonesia, `explain` per skill, ≤ 15 KB gzip per unit, lolos harness E1.

#### T3.16 `[sonnet]` Math kelas 1–2 (bilangan, banding, tambah/kurang, bentuk) + generator yang dibutuhkan
#### T3.17 `[sonnet]` Math kelas 3–4 (nilai tempat, operasi bersusun, kali/bagi, pecahan sederhana)
#### T3.18 `[sonnet]` Math kelas 5–6 (pecahan/desimal, persen, ukuran, data)
#### T3.19 `[sonnet]` Global Perspectives kelas 1–6 (bank soal, ≥ 20 item dasar/skill; tema lingkungan, budaya, kesehatan)
- Bila terlalu besar untuk 1 sesi: pecah 1–3 / 4–6 saat dikerjakan.
#### T3.20 `[sonnet]` Art & Design kelas 1–3 (warna & bentuk, pola, apresiasi batik/wayang; format `draw`)
#### T3.21 `[sonnet]` Art & Design kelas 4–6

### Blok G — Mini game, laporan, rilis

#### T3.22 `[sonnet]` Mini game Balon Angka dengan "dunia"
- **PRD:** FR-6, §8.1 (≤ 60 KB gzip), mockup `game-balon-v2.html` (B12).
- **Isi:** `games/balloon/` lazy, 60–120 detik, soal dari generator Math sesuai kelas, jeda (Lanjut/Selesai/Keluar), skor → XP & mastery lewat kontrak T3.4.
- **AC:** test logika game murni; E2E main → jeda → hasil; chunk ≤ 60 KB gzip; `prefers-reduced-motion`; frame stabil (trace DevTools mobile dicatat).

#### T3.23 `[sonnet]` Mini game Pola Batik
- **PRD:** FR-6, §5.1, mockup `game-batik.html` (B12).
- **Isi & AC:** sama seperti T3.22 untuk skill pola Art.

#### T3.24 `[sonnet]` Laporan anak ringkas (FR-9)
- **PRD:** FR-9, mockup `laporan.html`, `laporan-belum.html`.
- **Isi:** route lazy `#/report`: "Kamu jago di…" 3 teratas, "Ayo latih…" 3 terendah + "Latih sekarang", "Data belum cukup" bila < 10 soal; XP & streak di Beranda.
- **AC:** test komponen kedua keadaan; E2E dari Beranda; bahasa positif; ID=EN.

#### T3.25 `[sonnet]` Verifikasi akhir + rilis demo di Pages
- **PRD:** §14 Exit Criteria Fase 3, §8.1, §15.1.
- **Isi:** deploy Pages, cek route lazy/konten/SW offline di `/studykidsapp/`, ukur budget (JS awal, chunk game, JSON unit), Lighthouse Landing + Beranda, tabel bukti E1–E4 di `PROGRESS.md`, panduan uji singkat untuk Bimo (tanpa mengumpulkan data anak).
- **AC:** `npm run check`, `test:e2e`, Lighthouse CI hijau; tabel E1–E4 lengkap.

#### B13 Bimo + 3–5 anak mencoba demo di Pages; catat kesan (tanpa nama/foto/data anak) → masukan jadi task perbaikan sebelum gate

### Gate `[opus]` `/gate` → Bimo menulis "Fase 3 disetujui" → tag `phase-3-approved`

## Default yang dipakai (bisa diubah Bimo)

1. Konten Fase 3 = unit 1–2 lengkap; unit 3–4 hanya judul (terkunci). Isi unit 3+ di Fase 5.
2. "Laporan ringkas" Fase 3 = laporan anak. Laporan ortu (termasuk versi demo) di Fase 4 bersama Parent Gate.
3. CTA "Buka semua materi" = modal info sampai paywall ada (Fase 4).
4. Mini game demo: Balon Angka (Math) + Pola Batik (Art) (§5.1).
5. Gamifikasi Fase 3 = XP, bintang skill, streak dasar. Lencana, level, item avatar = Fase 5.
