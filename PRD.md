# PRD — StudyKids Web App

> **Versi:** 1.10 · **Tanggal:** 23 Nov 2026 · **Owner:** Bimo (Stairway Games)
> **Status:** Disetujui untuk Fase 0 · Perubahan dari v1.0 ada di "Riwayat Versi" (paling bawah)
> **Pembaca utama:** Claude Code (implementer) dan Bimo (product owner)

Dokumen ini adalah **satu-satunya sumber kebenaran (single source of truth)**. Jika ada konflik antara PRD dan asumsi Claude Code, **PRD yang menang**. Jika ada yang tidak tercakup di PRD, Claude Code **wajib bertanya**, bukan menebak (lihat §18).

Istilah wajib: **HARUS** = wajib, **TIDAK BOLEH** = dilarang, **SEBAIKNYA** = rekomendasi kuat, **BOLEH** = opsional.

---

## Daftar Isi

1. Ringkasan Produk
2. Tujuan & Metrik Sukses
3. Target Pengguna
4. Keputusan Kunci & Pendapat Harga
5. Scope: Demo vs Full, dan Out of Scope
6. Kurikulum & Konten
7. Kebutuhan Fungsional (FR)
8. Kebutuhan Non-Fungsional (NFR)
9. UI/UX, Brand & Logo
10. Tech Stack & Arsitektur
11. Struktur Folder
12. Data Model & Pengolahan Data
13. Spesifikasi API
14. Roadmap & Phase Gates
15. Testing, QA & Definition of Done
16. Workflow Claude Code (Model Routing, Hemat Limit Pro, Skills/Plugin/MCP)
17. Environment, Deployment & Update Berkala
18. Change Management (Update PRD / Fitur Baru)
19. Risiko & Mitigasi
20. Pertanyaan Terbuka
21. Lampiran: Repo & Library Rujukan

---

## 1. Ringkasan Produk

**StudyKids** adalah web app belajar interaktif untuk anak **SD kelas 1–6**, dengan kurikulum **terinspirasi oleh Cambridge Primary** (bukan afiliasi resmi). Belajar dibuat seperti bermain: soal yang selalu berbeda, mini games, bintang & lencana, serta laporan untuk orang tua tentang **keunggulan anak** dan **apa yang perlu ditingkatkan**.

- **Model bisnis:** Demo gratis selamanya (3 mapel) + **sekali bayar** untuk membuka semua mapel kelas 1–6.
- **Bahasa:** Indonesia & Inggris (bisa diganti kapan saja).
- **Platform:** Web app, mobile-first, ringan, bisa di-install (PWA), sebagian bisa offline.
- **Hosting target:** **Hostinger Indonesia** (rekomendasi final, lihat §17.2). Kode tetap hosting-agnostic sehingga pindah ke IDwebhost tidak mengubah kode.
- **Nama & domain:** **StudyKids** — domain **`studykids.id`** (tersedia per 21 Nov 2026; SEBAIKNYA segera dibeli di Fase 0). Semua teks nama/brand HARUS diambil dari satu file config (`brand.config.ts`) agar ganti nama = ganti satu file, untuk berjaga-jaga.
- **Maskot:** **Kiko**, blob jelly oranye yang ceria (lihat §9.4). Dipakai di app, feedback, dan marketing.
- **Repository:** [`github.com/medirty/studykidsapp`](https://github.com/medirty/studykidsapp) — satu repo (monorepo) untuk frontend, backend, dan dokumen. Preview demo: `https://medirty.github.io/studykidsapp/`. Aturan Git di §17.5.

---

## 2. Tujuan & Metrik Sukses

| Tujuan | Metrik | Target 3 bulan setelah launch |
|---|---|---|
| Anak suka belajar | Rata-rata sesi per anak per minggu | ≥ 3 sesi |
| Demo mengonversi | Konversi demo → beli | ≥ 3% dari akun ortu terdaftar |
| App terasa cepat | LCP di HP low-end (4G lambat) | < 2,5 detik |
| Kualitas | Bug kritis di produksi | 0 |
| Ortu merasa terbantu | Rating di form kritik & saran | ≥ 4/5 |

---

## 3. Target Pengguna

| Persona | Deskripsi | Kebutuhan utama |
|---|---|---|
| **Anak (6–12 th)** | Pengguna harian. Kelas 1–2 belum lancar membaca. | Tombol besar, ikon jelas, suara (TTS), feedback instan, seru. |
| **Orang tua** | Pembeli & pengawas. Pakai HP Android kelas menengah. | Daftar cepat, bayar mudah (QRIS/VA/e-wallet), laporan jelas. |
| **Admin (Bimo)** | Pemilik bisnis. | Lihat penjualan, analytics, kritik & saran, bantuan marketing. |

**Asumsi perangkat:** Android 3–4 GB RAM, Chrome, layar 360×800, koneksi tidak stabil. Desktop/tablet tetap didukung.

---

## 4. Keputusan Kunci & Pendapat Harga

### 4.1 Keputusan kunci (sudah final kecuali disebut lain)

| # | Keputusan | Alasan |
|---|---|---|
| K1 | **Akun orang tua + profil anak** (maks. 4 profil per akun). Anak masuk dengan memilih avatar (+ PIN 4 digit opsional). | Anak SD tidak perlu email/password. Satu pembelian berlaku untuk semua anak di keluarga. |
| K2 | **Demo bisa dicoba tanpa login** (progress disimpan di perangkat). Daftar akun diminta saat ingin menyimpan progress lintas perangkat atau membeli. | Mengurangi hambatan awal. |
| K3 | Frontend **SPA statis** (Svelte + Vite) + backend **PHP 8.4** (kode tetap kompatibel 8.2+) + **MySQL/MariaDB** bawaan hosting. | Jalan di semua shared hosting Indonesia, tanpa biaya database tambahan. |
| K4 | **Soal dibuat oleh generator** (template + angka/kata acak ber-seed), bukan bank soal statis saja. | Soal tidak monoton dan hampir tak terbatas. |
| K5 | **Speech pakai Web Speech API** bawaan perangkat. Tanpa API berbayar. | Gratis, offline-capable di banyak perangkat. |
| K6 | **Pembayaran dikerjakan paling akhir** (Fase 6). Sebelum itu, unlock memakai **kode aktivasi manual** dari admin. | Owner belum pernah daftar payment gateway; bisnis bisa jalan dulu. |
| K7 | Tidak ada iklan, tidak ada chat antar pengguna. | Keamanan anak. |
| K8 | **Hosting: Hostinger** (paket Business Web Hosting; minimal Premium), data center Indonesia. Keputusan harus final **sebelum Fase 4**; Fase 0–3 tidak butuh hosting (pakai lokal + GitHub Pages). | SSH, Git deploy, cron, PHP 8.2+, MySQL, SSL gratis; opsi Node.js di masa depan. Detail §17.2. |
| K9 | **Dev lokal: MariaDB 11.8 standalone** (service Windows, versi sama dengan Hostinger) + PHP 8.4 di `C:\php-8.4`; server dijalankan dari terminal (`npm run dev`). XAMPP tidak dipakai (CR-004). Tanpa MCP database. | Laptop = CI = produksi (MariaDB 11.8), tidak perlu start manual, Claude Code akses DB lewat CLI. Detail §17.1. |
| K10 | **Routing model Opus/Sonnet otomatis** lewat konfigurasi `.claude/` (opusplan + subagent + slash command ber-model). Bimo tidak perlu mengganti model manual. | Detail §16.2. |

### 4.2 Harga (FINAL)

| Tahap | Harga | Syarat |
|---|---|---|
| **Early bird** | **Rp50.000** | **100 pembeli pertama** (dihitung dari order berstatus `paid`) |
| **Normal** | **Rp100.000** | Setelah kuota early bird habis |

Hitungan kasar: biaya gateway QRIS ±0,7% (≈ Rp350–700) atau VA ≈ Rp4.000–4.500 per transaksi; hosting + domain tertutup oleh ±2 penjualan/bulan. Biaya server per user hampir nol karena soal dibuat di browser.

**Aturan teknis early bird (WAJIB):**

1. Harga dikunci **saat order dibuat**: jika `paid_count + pending_aktif < 100` → harga early bird, selain itu harga normal. Order `pending` kedaluwarsa setelah **60 menit** dan slotnya kembali tersedia.
2. Pengecekan kuota dilakukan **di server dalam transaksi DB** (row lock pada counter di tabel `settings`) agar tidak terjual > 100 saat banyak orang bayar bersamaan.
3. Landing page & paywall menampilkan **"Sisa X slot harga Rp50.000"** (dari `/api/settings/public`), lalu otomatis berganti ke Rp100.000 saat habis.
4. Pengguna **kode aktivasi manual** (sebelum Fase 6) TIDAK mengurangi kuota early bird kecuali admin menandainya sebagai penjualan.
5. Voucher/referral dihitung dari harga yang berlaku saat itu, dan harga akhir tidak boleh < Rp25.000 (`min_price`).
6. Semua angka di atas disimpan di tabel `settings` dan bisa diubah dari admin: `price_early = 50000`, `price_normal = 100000`, `early_quota = 100`, `pending_ttl_minutes = 60`, `min_price = 25000`.

**Kebijakan:** "seumur hidup" = akses penuh selama layanan StudyKids beroperasi, termasuk update konten, maks. 4 profil anak. "Tanpa refund" SEBAIKNYA tetap dengan pengecualian **kegagalan teknis** (sudah bayar tapi akses tidak bisa dibuka). Untuk aspek hukum perlindungan konsumen, konsultasikan dengan ahli.

---

## 5. Scope

### 5.1 Demo vs Full

| Fitur | Demo (gratis selamanya) | Full (sekali bayar) |
|---|---|---|
| Mapel | Math, Global Perspectives, Art & Design | Semua 8 mapel |
| Kelas | 1–6 | 1–6 |
| Isi per mapel | **Hanya Unit 1–2 tiap kelas** (FINAL), unit lain terkunci dan terlihat dengan gembok | Semua unit |
| Mini games | 2 game | Semua game |
| Laporan ortu | Ringkas (3 kekuatan, 3 yang perlu ditingkatkan) | Lengkap per mapel & per skill + riwayat |
| Profil anak | 1 | Maks. 4 |
| Sinkron antar perangkat | Ya (jika login) | Ya |

> Batas demo disimpan di config: `demo.subjects = ["math","gp","art"]`, `demo.unit_limit = 2`. Mini game di demo hanya yang terkait mapel demo (mis. Balon Angka & Pola Batik).

### 5.2 Out of Scope (versi 1)

- Aplikasi native Android/iOS (PWA sudah cukup).
- Live class, chat, forum, atau konten buatan pengguna.
- AI generatif berbayar di runtime.
- Langganan bulanan.
- Multi-bahasa selain ID/EN.
- Posting otomatis ke media sosial via API (marketing tools hanya menyiapkan konten; lihat FR-13).

---

## 6. Kurikulum & Konten

### 6.1 Aturan legal (WAJIB)

- Kurikulum **terinspirasi oleh** struktur Cambridge Primary. **TIDAK BOLEH** memakai logo Cambridge, menyalin teks/soal/buku Cambridge, atau mengklaim "resmi/terakreditasi Cambridge".
- Kalimat yang boleh dipakai di marketing: *"Kurikulum terinspirasi standar internasional (Cambridge Primary)"*. Disclaimer di footer: *"StudyKids tidak berafiliasi dengan Cambridge University Press & Assessment."*
- Semua soal, cerita, gambar adalah **karya orisinal** StudyKids atau aset berlisensi bebas (CC0 / lisensi komersial jelas), dicatat di `docs/ASSET_LICENSES.md`.

### 6.2 Struktur konten

```
Mapel (subject) → Kelas (grade 1–6) → Unit (4–6 per kelas) → Skill (3–6 per unit) → Soal (dari generator)
```

Setiap **skill** punya ID unik, mis. `math.g3.u2.s1` ("Penjumlahan 3 digit dengan menyimpan"). Skill adalah satuan untuk menghitung **mastery** (FR-9).

### 6.3 Strand per mapel (kerangka; isi detail dibuat di Fase 3)

| Mapel | Strand |
|---|---|
| **Math** | Number; Geometry & Measure; Statistics & Probability |
| **English** | Reading; Writing; Speaking & Listening; Vocabulary & Grammar |
| **Science** | Biology; Chemistry; Physics; Earth & Space; Thinking & Working Scientifically |
| **Global Perspectives** | Research; Analysis; Evaluation; Reflection; Collaboration; Communication (tema: lingkungan, budaya, kesehatan, teknologi) |
| **Wellbeing** | Emosi & diri sendiri; Hubungan dengan orang lain; Hidup sehat; Keamanan diri (termasuk aman di internet) |
| **Art & Design** | Warna & bentuk; Menggambar & mewarnai digital; Pola; Apresiasi seni (termasuk seni Indonesia: batik, wayang, dll.) |
| **Music** | Ritme & ketukan; Nada & melodi; Mengenal alat musik; Mendengarkan & apresiasi (termasuk musik daerah) |
| **Computing & Technology** | Computational thinking; Algoritma & urutan (coding blok sederhana); Data; Literasi digital & keamanan online |

**Konteks lokal:** contoh soal SEBAIKNYA memakai konteks Indonesia (Rupiah, nama lokal, makanan, kota) agar relevan, tanpa mengubah kerangka keterampilan.

### 6.4 Format konten (data, bukan kode)

Konten disimpan sebagai **JSON** di `src/content/{subject}/g{grade}/u{unit}.json`, berisi metadata unit, skill, dan **referensi generator + parameter**. Teks dua bahasa selalu disimpan sebagai objek `{ "id": "...", "en": "..." }`.

```json
{
  "id": "math.g3.u2",
  "title": { "id": "Penjumlahan & Pengurangan", "en": "Addition & Subtraction" },
  "skills": [
    {
      "id": "math.g3.u2.s1",
      "title": { "id": "Menjumlah 3 digit (menyimpan)", "en": "3-digit addition with regrouping" },
      "generators": [
        { "type": "arith.add", "params": { "digits": 3, "regroup": true }, "formats": ["mcq", "input", "dragdrop"] }
      ],
      "explain": { "id": "Jumlahkan dari satuan dulu...", "en": "Add the ones first..." }
    }
  ]
}
```

### 6.5 Jumlah konten minimum untuk launch

- Setiap mapel × kelas: **≥ 4 unit**, setiap unit **≥ 3 skill**, setiap skill **≥ 1 generator** yang mampu menghasilkan **≥ 50 soal unik**.
- Mapel non-eksak (Wellbeing, GP, Art, Music) memakai **bank soal + randomisasi** (acak urutan, acak pilihan, acak gambar/konteks) dengan minimum **20 item dasar per skill**.

---

## 7. Kebutuhan Fungsional (FR)

Format: setiap FR punya **Acceptance Criteria (AC)**. Fitur dianggap selesai hanya jika semua AC lolos dan ada test-nya.

### FR-1 Landing page

- Halaman publik: hero dengan maskot Kiko, keunggulan, daftar mapel, contoh soal yang bisa langsung dicoba, harga (early bird + penghitung sisa slot), FAQ, tombol "Coba Gratis".
- AC: Lighthouse mobile Performance ≥ 90, SEO ≥ 95; teks ID/EN; tombol "Coba Gratis" membawa ke pemilihan kelas dalam ≤ 2 klik; penghitung slot sesuai data server (di mode lokal tampilkan harga dari config).

### FR-2 Akun orang tua & profil anak

- Daftar: nama, email, password (min. 8 karakter). Verifikasi email via link (pakai fungsi `mail()`/SMTP hosting).
- Login, logout, lupa password (link reset berlaku 60 menit).
- Profil anak: nama panggilan, kelas (1–6), avatar (pilih dari 12 avatar orisinal), PIN 4 digit opsional.
- **Parent Gate:** area ortu (laporan, pembelian, pengaturan) dilindungi soal hitungan sederhana untuk dewasa (mis. "ketik hasil 7 × 8") atau password ortu.
- Progress demo tanpa login di-merge ke akun saat daftar.
- AC: anak bisa mulai belajar dalam ≤ 3 tap setelah buka app; data anak tidak berisi email/nomor HP anak; merge progress tidak menduplikasi data.

### FR-3 Pemilihan bahasa

- Toggle ID/EN di header & pengaturan; tersimpan per profil.
- Mode khusus **English subject**: instruksi BOLEH tetap bahasa Indonesia untuk kelas 1–2 (setting ortu).
- AC: tidak ada teks hardcode di komponen; semua lewat `i18n`; test otomatis memastikan setiap key ada di kedua bahasa.

### FR-4 Peta belajar (Learning Map)

- Tampilan peta/jalur per mapel per kelas: unit sebagai "pulau", skill sebagai titik. Status: terkunci / tersedia / bintang 1–3.
- Unit terkunci pada demo menampilkan gembok + CTA "Buka semua materi".
- AC: peta tampil < 1 detik setelah navigasi (data lokal); bisa di-scroll lancar 60fps di HP target.

### FR-5 Sesi belajar & engine soal (inti produk)

**Alur sesi:** pilih skill → 8–10 soal → feedback tiap soal → ringkasan (bintang, XP, skill yang naik/turun).

**Format soal (minimal):**

| Kode | Format | Contoh |
|---|---|---|
| `mcq` | Pilihan ganda (teks/gambar) | 3 + 4 = ? |
| `input` | Isian angka/kata (keyboard angka khusus) | Ketik hasilnya |
| `tf` | Benar/Salah | |
| `dragdrop` | Seret ke tempat yang benar | Kelompokkan hewan |
| `match` | Pasangkan | Kata ↔ gambar |
| `order` | Urutkan | Urutkan angka/tahap |
| `tap` | Ketuk gambar yang benar | Ketuk segitiga |
| `listen` | Dengar lalu jawab (TTS) | English listening |
| `draw` | Kanvas mewarnai/menggambar (Art) | Tidak dinilai benar/salah, hanya diselesaikan |

**Aturan variasi (soal tidak monoton):**

1. Setiap soal dibuat oleh **generator** dengan **seeded RNG** (`seed = profileId + skillId + sessionCounter`) sehingga bisa direproduksi untuk debugging.
2. **Anti-repeat:** soal dengan *fingerprint* sama tidak boleh muncul lagi dalam 5 sesi terakhir skill itu (fingerprint = hash dari parameter inti).
3. Dalam satu sesi, format soal dirotasi (maks. 3 soal berurutan dengan format sama).
4. Pilihan jawaban MCQ diacak; distraktor dibuat dari **kesalahan umum** (mis. lupa menyimpan), bukan angka acak.
5. **Adaptif:** 2 benar berturut-turut → tingkat naik; 2 salah berturut-turut → tingkat turun + tampilkan petunjuk.
6. **Spaced repetition ringan:** 20% soal tiap sesi diambil dari skill lama yang mastery-nya menurun.

**Feedback:**

- Benar: animasi + suara singkat + XP.
- Salah: tunjukkan jawaban benar + **penjelasan singkat** (dari `explain`) + tombol "dengarkan".
- Tidak ada hukuman/nyawa habis yang membuat anak frustrasi.

AC:
- Unit test: setiap generator menghasilkan ≥ 50 soal unik dari 1.000 percobaan, semua jawaban terverifikasi benar oleh fungsi validator.
- Seed sama → soal sama (deterministik).
- Sesi tetap berjalan saat offline; hasil disinkronkan saat online.

### FR-6 Mini games

- Mini game = cara lain berlatih skill (bukan game kosong). Durasi 60–120 detik.
- Minimal 6 game untuk launch, contoh:
  1. **Balon Angka** (Math) — pecahkan balon dengan jawaban benar.
  2. **Kereta Kata** (English) — susun huruf/kata.
  3. **Lab Mini** (Science) — kelompokkan benda (padat/cair/gas).
  4. **Keliling Dunia** (GP) — cocokkan budaya/tempat.
  5. **Pola Batik** (Art) — lanjutkan pola.
  6. **Tepuk Ritme** (Music) — ulangi pola ketukan.
  7. **Robot Jalan** (Computing) — susun perintah panah untuk menggerakkan robot.
- Dibangun dengan **DOM/CSS + Canvas ringan**, tanpa game engine berat. Setiap game di-*lazy load* (chunk terpisah, ≤ 60 KB gzip per game).
- AC: 60fps di HP target; bisa di-pause; skor masuk ke XP & mastery skill terkait.

### FR-7 Gamifikasi

- XP, level profil, bintang per skill, **streak harian** (dengan 1 "hari libur" gratis per minggu agar tidak menekan), lencana (mis. "10 hari berturut-turut", "Master Pecahan").
- Avatar bisa dihias dengan item yang dibuka dari XP (item kosmetik saja).
- AC: tidak ada mekanik yang membuat anak merasa gagal (tidak ada "streak hilang" dengan pesan negatif).

### FR-8 Speech (suara perangkat)

- **Text-to-Speech:** `window.speechSynthesis`. Tombol 🔊 pada setiap instruksi & soal (wajib untuk kelas 1–2, otomatis dibacakan jika setting aktif). Pilih suara `id-ID` atau `en-US/en-GB` sesuai bahasa.
- **Speech Recognition (opsional, progressive enhancement):** untuk latihan pengucapan English jika browser mendukung `SpeechRecognition`. Jika tidak didukung, fitur disembunyikan—bukan error.
- AC: jika suara bahasa tertentu tidak tersedia di perangkat, tampilkan pesan ramah & fallback ke suara default; tidak ada request jaringan untuk speech.

### FR-9 Laporan keunggulan & area perbaikan

- **Mastery per skill** (0–100) dihitung dengan rata-rata tertimbang hasil terbaru (jawaban baru bobot lebih besar; decay jika lama tidak latihan).
- **Keunggulan:** 3 skill/strand dengan mastery tertinggi (min. 10 soal dikerjakan).
- **Perlu ditingkatkan:** 3 skill dengan mastery terendah + **rekomendasi aksi** (tombol "Latih sekarang" langsung ke skill itu).
- Laporan untuk anak: bahasa positif ("Kamu jago di… Ayo latih…").
- Laporan untuk ortu (di balik Parent Gate): grafik mingguan, waktu belajar, mapel terkuat/terlemah, riwayat 30 hari. Full: per mapel & per skill.
- AC: rumus mastery terdokumentasi & di-unit-test; laporan tidak menampilkan kesimpulan jika data < 10 soal ("Data belum cukup").

### FR-10 Paywall & unlock

- Konten Full terkunci untuk akun tanpa `entitlement`.
- Sebelum Fase 6: ortu memasukkan **kode aktivasi** (format `SK-XXXX-XXXX`, sekali pakai) yang dibuat admin.
- Setelah Fase 6: tombol "Beli" → payment gateway → webhook → entitlement aktif otomatis.
- AC: pengecekan entitlement dilakukan **di server** untuk data yang disinkronkan; konten Full di frontend di-*bundle* terpisah dan hanya diunduh setelah entitlement terverifikasi (token bertanda tangan).

### FR-11 Pembayaran (Fase 6 — terakhir)

- **Rekomendasi gateway:** **Midtrans Snap** (bisa daftar sebagai **individu dengan KTP**; mendukung QRIS, GoPay, ShopeePay, VA bank). Alternatif: **Mayar.id** atau **Tripay** jika verifikasi Midtrans lama.
- Kode integrasi dibuat di balik interface `PaymentProvider` agar gateway bisa diganti tanpa ubah logika lain.
- Alur: buat order (status `pending`, harga dikunci sesuai aturan early bird §4.2) → Snap token → bayar → **webhook** (verifikasi signature) → status `paid` → entitlement aktif → email kuitansi.
- Order `pending` > 60 menit otomatis `expired` (cron tiap 5 menit + pengecekan saat order baru dibuat).
- Idempotensi: webhook yang sama datang 2× tidak membuat entitlement/penjualan ganda.
- Panduan daftar gateway ditulis di `docs/PAYMENT_SETUP.md` (langkah demi langkah untuk Bimo) pada awal Fase 6.
- AC: diuji penuh di **sandbox**; skenario sukses, gagal, kedaluwarsa, webhook ganda, webhook palsu (signature salah) semuanya ter-test.

### FR-12 Kritik & saran

- Form sederhana (rating 1–5 bintang + teks + kategori: bug / konten / ide / lainnya). Bisa dari menu ortu & setelah 5 sesi pertama (sekali, bisa ditutup).
- Rate limit: maks. 5 kiriman per akun per hari.
- AC: masuk ke admin dengan status `baru / dibaca / ditindaklanjuti`.

### FR-13 Admin panel (`/admin`)

Login admin terpisah (password kuat + 2FA TOTP). Halaman:

1. **Dashboard:** total pengguna (ortu & profil anak), DAU/WAU, sesi hari ini, konversi demo→full, total pembelian, **total penjualan (Rp)** hari ini/bulan ini/semua, grafik 30 hari.
2. **Penjualan/Finance:** daftar order (filter status/tanggal), total kotor, perkiraan fee gateway, total bersih, export CSV.
3. **Pengguna:** cari akun, lihat status entitlement, buat/cabut kode aktivasi, reset akses (untuk support).
4. **Konten analytics:** skill dengan tingkat salah tertinggi (indikasi soal sulit/bug), mapel terpopuler.
5. **Kritik & saran:** list, filter, ubah status.
6. **Pengaturan:** harga early bird & normal, kuota early bird (tampilkan "terjual X/100"), teks banner pengumuman.
7. **Marketing tools** (FR-14).

AC: semua angka finance dihitung dari tabel `orders` berstatus `paid` (bukan disimpan manual); halaman admin tidak ikut di bundle aplikasi anak.

### FR-14 Automatic Marketing Tools (sederhana, tepat sasaran)

Target audiens: **orang tua 28–45 th** di Instagram, TikTok, Facebook, WhatsApp.

1. **Generator konten otomatis (template-based, tanpa API berbayar):**
   - Kalender konten 30 hari otomatis dengan tema bergilir: tips belajar, contoh soal seru ("Anak kelas 3 bisa jawab ini?"), fakta sains, testimoni (hanya dari feedback asli yang disetujui), promo. Maskot **Kiko** jadi "wajah" setiap post.
   - **Template urgensi early bird** otomatis memakai angka asli ("Tinggal 23 slot Rp50.000!"); otomatis berhenti dipakai saat kuota habis.
   - Caption otomatis per platform (panjang & hashtag berbeda untuk IG/TikTok/FB/WA) dalam ID/EN.
   - **Gambar post otomatis** (1080×1080 & 1080×1920) dirender dengan Canvas dari template brand + **soal acak dari generator** atau **statistik nyata** ("12.000 soal dikerjakan minggu ini"). Tombol unduh PNG.
2. **Link tracking (UTM builder):** buat link dengan `utm_source/medium/campaign`; dashboard menampilkan kunjungan, daftar, dan pembelian per kampanye.
3. **Kode referral & voucher:** setiap ortu pembeli dapat kode referral (mis. diskon Rp10.000 untuk teman); admin bisa buat voucher dengan kuota & tanggal kedaluwarsa.
4. **Share card anak:** setelah dapat lencana, ortu bisa share kartu pencapaian (tanpa nama lengkap/foto anak) yang berisi link referral.
5. **Pengingat jadwal posting:** daftar "hari ini posting apa" di dashboard admin (bukan auto-post).

AC: konten yang dihasilkan tidak memuat data pribadi anak; setiap link UTM tercatat dan bisa diatribusikan ke order.

---

## 8. Kebutuhan Non-Fungsional (NFR)

### 8.1 Performance budget (HARUS dipenuhi, dicek di CI)

| Metrik | Batas |
|---|---|
| JS awal (gzip) | ≤ 120 KB |
| CSS awal (gzip) | ≤ 25 KB |
| Per mini game chunk (gzip) | ≤ 60 KB |
| Per file konten JSON unit (gzip) | ≤ 15 KB |
| Gambar | WebP/SVG, ≤ 50 KB per gambar, lazy load |
| LCP (Moto G Power, Slow 4G) | < 2,5 s |
| INP | < 200 ms |
| CLS | < 0,1 |
| Lighthouse mobile Performance | ≥ 90 |
| Respons API (p95) | < 300 ms |

Font: maksimal 2 keluarga font, self-hosted, `font-display: swap`, subset Latin.

### 8.2 Offline & PWA

- Installable (manifest + ikon). Service worker meng-cache shell app + konten yang sudah dibuka.
- Progress disimpan di IndexedDB lalu disinkronkan (antrian event) saat online.
- Update app: service worker menampilkan "Versi baru tersedia — muat ulang" (tidak memaksa di tengah sesi).

### 8.3 Keamanan

- Password: `password_hash()` (bcrypt/argon2). Session via cookie `HttpOnly; Secure; SameSite=Lax`.
- Semua query pakai **prepared statements (PDO)**. Tidak ada SQL string concatenation.
- CSRF token untuk request yang mengubah data. Rate limiting login (5 gagal → tunggu 15 menit).
- Validasi input di server untuk semua endpoint. Output di-escape.
- Secret (DB, gateway key) hanya di `.env` di luar `public_html`; **TIDAK BOLEH** di-commit.
- Header keamanan: CSP, HSTS, X-Content-Type-Options, Referrer-Policy.

### 8.4 Privasi anak (penting)

- Data anak minimal: nama panggilan, kelas, avatar, progress. **Tanpa** foto, email, nomor HP, lokasi anak.
- Tidak ada pelacak pihak ketiga (tanpa Google Analytics/Facebook Pixel di area anak). Analytics dibuat sendiri (first-party, anonim).
- Kebijakan privasi & syarat layanan (ID/EN) tersedia sebelum launch, mengacu pada UU PDP Indonesia (UU 27/2022). Ortu bisa **hapus akun & semua data** dari pengaturan.

### 8.5 Aksesibilitas

- Target WCAG 2.1 AA: kontras ≥ 4.5:1, target sentuh ≥ 48×48 px, fokus keyboard terlihat, `alt` pada gambar, tidak mengandalkan warna saja (✓/✗ + warna).
- Opsi "kurangi animasi" mengikuti `prefers-reduced-motion`.

### 8.6 Kompatibilitas

- Chrome Android 100+, Safari iOS 15+, Chrome/Edge/Firefox desktop versi terbaru − 2.

---

## 9. UI/UX, Brand & Logo

### 9.1 Prinsip UX

1. **Satu layar = satu tugas.** Tombol aksi utama besar di bawah (jangkauan jempol).
2. **Kelas 1–2:** minim teks, ikon + suara. **Kelas 5–6:** tampilan lebih "dewasa" (jangan kekanak-kanakan).
3. Feedback < 100 ms untuk setiap tap.
4. Bahasa positif & menyemangati; tidak ada kata "salah besar/gagal".
5. Maks. 3 level navigasi: Beranda → Mapel/Peta → Sesi.

### 9.2 Design system (token)

| Token | Nilai |
|---|---|
| Brand / Primary ("Kiko Orange") | `#FF6B3D` — teks di atasnya pakai Ink (bukan putih) agar kontras AA |
| Ink (teks & elemen gelap) | `#1B1340` |
| Sunny (bintang, highlight) | `#FFC93C` |
| Teal (aksen) | `#2EC4B6` |
| Bubblegum (aksen lembut) | `#FF9EC4` |
| Success | `#22A55B` |
| Error (lembut, selalu disertai ikon) | `#D93A4A` |
| Background | `#FFF8F2` (krem hangat) |
| Warna per mapel | Math `#2459D6`, English `#8B5CF6`, Science `#22A55B`, GP `#0EA5E9`, Wellbeing `#EC4899`, Art `#FF8A1F`, Music `#F43F5E`, Computing `#14B8A6` |
| Radius | 12 / 20 / 999 px |
| Font | **Baloo 2** (judul), **Nunito** (teks) — self-hosted |
| Spacing | skala 4 px (4, 8, 12, 16, 24, 32, 48) |

Token disimpan di `src/styles/tokens.css` sebagai CSS variables. **TIDAK BOLEH** ada warna/hex hardcode di komponen.

### 9.3 Layar utama (wajib di-mockup di Fase 1)

1. Landing page (mobile & desktop)
2. Pilih kelas / pilih profil anak
3. Beranda anak (mapel, streak, lanjutkan belajar)
4. Peta belajar mapel
5. Layar soal (tiap format soal)
6. Feedback benar / salah
7. Ringkasan sesi
8. Mini game (1 contoh)
9. Laporan anak & laporan ortu
10. Parent Gate, paywall/unlock, form kritik & saran
11. Admin: dashboard, penjualan, marketing tools

### 9.4 Logo

**Brief (v1.1):** sederhana, kuat, mudah diingat, **tidak kaku, tidak terlihat "sekolah/edukasi", lebih ke fun** (rasa mainan/game, bukan buku pelajaran). Terbaca di 32 px (favicon), bekerja satu warna.

**Larangan visual logo:** buku, toga, pensil, papan tulis, apel, huruf ABC, bola lampu. Ikon-ikon itu terlalu "sekolah".

**Konsep terpilih:** maskot **Kiko**, blob jelly oranye yang sedikit miring (terasa memantul), mata besar mengilap, dan senyum lebar, ditambah percikan bintang kuning & titik teal. Wordmark "study" (Ink) + "kids" (oranye) dengan "kids" sedikit miring ke atas, seolah melompat.

- File konsep: `docs/brand/logo-concept-v2.svg` (konsep v1 dengan buku tidak dipakai lagi).
- Kiko punya 4 ekspresi untuk app: senang (benar), semangat (salah/coba lagi), kaget (lencana baru), tidur (lama tidak belajar). Dibuat di Fase 1 sebagai SVG.
- Di Fase 1, Claude Code membuat versi final: ikon Kiko saja (favicon, PWA 192/512, maskable), horizontal, versi satu warna/putih, dan **wordmark diubah ke path** (tidak bergantung font).
- AC: ikon tetap dikenali di 32×32 px; Bimo menyetujui sebelum Fase 2.

---

## 10. Tech Stack & Arsitektur

### 10.1 Stack (final)

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Frontend | **Svelte 5 + Vite + TypeScript** (SPA) | Bundle sangat kecil & cepat, cocok HP low-end. |
| Routing | `svelte-spa-router` (hash/history) | Ringan, jalan di hosting statis & GitHub Pages. |
| Styling | CSS biasa + CSS variables (tanpa framework CSS berat) | Kontrol penuh atas ukuran CSS. |
| Penyimpanan lokal | **IndexedDB via Dexie.js** | Progress offline & antrian sinkron. |
| PWA | `vite-plugin-pwa` (Workbox) | Offline + installable. |
| Grafik (admin & laporan ortu) | **uPlot** (lazy load) | Sangat ringan. |
| Efek | `canvas-confetti` | Ringan. |
| Backend | **PHP 8.4 + Slim 4** (micro-framework); kode tidak boleh memakai fitur khusus 8.3/8.4 agar tetap jalan di 8.2 | Didukung semua shared hosting Indonesia. PHP 8.2 berhenti mendapat patch keamanan akhir Des 2026, sebelum launch, jadi dev & produksi memakai 8.4. |
| Database | **MariaDB 11.8** (bawaan Hostinger; lokal & CI memakai versi yang sama) | Gratis termasuk paket hosting. Koneksi mengatur charset/collation/sql_mode/zona waktu sendiri agar perilaku sama di semua server. |
| Migrasi DB | **Phinx** | Skema versi-terkontrol. |
| Email | PHPMailer + SMTP email hosting | Gratis dari hosting. |
| Testing FE | **Vitest** (unit) + **Playwright** (E2E, mobile viewport) | |
| Testing BE | **PHPUnit** | |
| Lint/format | ESLint + Prettier + svelte-check; PHP-CS-Fixer + PHPStan level 6 | Kode rapi & konsisten. |
| CI/CD | **GitHub Actions** | Test otomatis + deploy. |

> **Kenapa bukan Node.js backend?** Node.js di Hostinger hanya tersedia di paket tertentu (Business/Cloud) dan belum tentu di IDwebhost. PHP + MySQL dijamin jalan di paket termurah sekalipun, sehingga tidak perlu biaya tambahan.

### 10.2 Arsitektur

```
[Browser / PWA]
  ├─ App anak (Svelte SPA)  ──┐
  │    ├─ Engine soal & generator (jalan 100% di browser)
  │    ├─ Mini games (lazy chunks)
  │    └─ IndexedDB (progress + antrian event)
  ├─ Area ortu (di balik Parent Gate)
  └─ Admin (bundle terpisah, /admin)
             │  HTTPS JSON (REST)
             ▼
[Shared hosting: public_html]
  ├─ /            → file statis hasil build (index.html, assets)
  ├─ /api/*       → PHP Slim (index.php)  ──► MySQL/MariaDB
  └─ webhook pembayaran → /api/payments/webhook
```

**Prinsip:**

- **Logika soal di klien**, server hanya menyimpan hasil (event) → server ringan & murah.
- **Server adalah sumber kebenaran** untuk akun, entitlement, order, dan agregat analytics.
- **Mode lokal (`VITE_API_MODE=local`)**: app demo bisa jalan tanpa backend (data di IndexedDB) → bisa di-deploy ke **GitHub Pages** untuk testing.

---

## 11. Struktur Folder

```
studykidsapp/                   # root repo github.com/medirty/studykidsapp
├─ CLAUDE.md                    # aturan untuk Claude Code (ringkas, rujuk PRD)
├─ PRD.md                       # dokumen ini
├─ .claude/
│  ├─ settings.json             # model: opusplan, permissions.deny
│  ├─ agents/                   # architect (opus), reviewer (opus), implementer (sonnet), tester (sonnet)
│  └─ commands/                 # next, plan-phase, fix, gate, cr
├─ README.md
├─ .env.example
├─ .github/workflows/
│  ├─ ci.yml                    # lint, typecheck, test, bundle-size, lighthouse
│  ├─ deploy-pages.yml          # demo ke GitHub Pages (mode lokal)
│  └─ deploy-hosting.yml        # deploy ke hosting (manual trigger / tag)
├─ docs/
│  ├─ PROGRESS.md               # status fase & task (WAJIB di-update tiap akhir sesi)
│  ├─ DECISIONS.md              # log keputusan (ADR singkat)
│  ├─ CHANGELOG.md
│  ├─ CHANGE_REQUESTS.md        # permintaan perubahan PRD (lihat §18)
│  ├─ ASSET_LICENSES.md
│  ├─ PAYMENT_SETUP.md          # dibuat di Fase 6
│  ├─ DEPLOY.md
│  ├─ brand/                    # logo, ikon
│  └─ mockups/                  # mockup HTML Fase 1
├─ frontend/
│  ├─ index.html
│  ├─ vite.config.ts
│  ├─ src/
│  │  ├─ main.ts
│  │  ├─ App.svelte
│  │  ├─ brand.config.ts        # nama, tagline, warna brand (ganti nama = ganti file ini)
│  │  ├─ routes/                # halaman: landing, home, map, session, report, parent, ...
│  │  ├─ components/
│  │  │  ├─ ui/                 # Button, Card, Modal, ProgressBar, Avatar, ...
│  │  │  └─ question/           # Mcq, Input, DragDrop, Match, Order, Tap, Listen, Draw
│  │  ├─ engine/
│  │  │  ├─ rng.ts              # seeded RNG
│  │  │  ├─ session.ts          # alur sesi, adaptif, anti-repeat
│  │  │  ├─ mastery.ts          # rumus mastery
│  │  │  └─ generators/         # math/, english/, science/, ... (1 file per tipe generator)
│  │  ├─ games/                 # 1 folder per mini game (lazy loaded)
│  │  ├─ content/               # JSON konten per mapel/kelas/unit
│  │  ├─ i18n/                  # id.json, en.json, index.ts
│  │  ├─ stores/                # Svelte stores (profile, settings, entitlement)
│  │  ├─ services/
│  │  │  ├─ api.ts              # client API (+ adapter mode lokal)
│  │  │  ├─ db.ts               # Dexie
│  │  │  ├─ sync.ts             # antrian event & sinkron
│  │  │  └─ speech.ts           # wrapper Web Speech API
│  │  ├─ styles/                # tokens.css, base.css
│  │  └─ lib/                   # util murni (tanpa side effect)
│  ├─ admin/                    # entry terpisah untuk /admin
│  ├─ public/                   # ikon PWA, font, gambar
│  └─ tests/
│     ├─ unit/
│     └─ e2e/
├─ backend/
│  ├─ public/index.php          # entry Slim (di-deploy ke public_html/api)
│  ├─ src/
│  │  ├─ Routes/
│  │  ├─ Controllers/
│  │  ├─ Services/              # AuthService, EntitlementService, AnalyticsService, ...
│  │  ├─ Payments/              # PaymentProvider interface + MidtransProvider
│  │  ├─ Repositories/          # akses DB (PDO)
│  │  ├─ Middleware/            # auth, csrf, rate-limit, admin
│  │  └─ Support/
│  ├─ db/migrations/            # Phinx
│  ├─ db/seeds/
│  ├─ tests/
│  └─ composer.json
└─ scripts/                     # build-deploy, check-bundle-size, generate-content-report
```

---

## 12. Data Model & Pengolahan Data

### 12.1 Tabel MySQL (inti)

| Tabel | Kolom penting |
|---|---|
| `parents` | id, name, email (unique), password_hash, email_verified_at, locale, referral_code, created_at |
| `children` | id, parent_id (FK), nickname, grade (1–6), avatar_id, pin_hash (nullable), locale, xp, level, created_at |
| `entitlements` | id, parent_id, plan (`full`), source (`payment`/`code`/`admin`), order_id (nullable), granted_at, revoked_at |
| `activation_codes` | id, code (unique), created_by, used_by_parent_id, used_at, expires_at |
| `orders` | id, parent_id, order_code (unique), amount, voucher_id, status (`pending/paid/failed/expired`), provider, provider_ref, fee_estimate, utm_campaign, paid_at, created_at |
| `payment_events` | id, order_id, provider_event_id (unique, untuk idempotensi), payload_json, received_at |
| `progress_events` | id, child_id, skill_id, correct (bool), format, difficulty, duration_ms, client_event_id (unique), created_at |
| `skill_mastery` | child_id, skill_id, mastery (0–100), attempts, last_practiced_at (PK: child_id+skill_id) |
| `badges` | child_id, badge_id, earned_at |
| `feedback` | id, parent_id, rating, category, message, status, created_at |
| `vouchers` | id, code, discount_amount, quota, used_count, starts_at, ends_at |
| `referrals` | id, referrer_parent_id, referred_parent_id, order_id, created_at |
| `marketing_links` | id, campaign, source, medium, url, created_at |
| `analytics_daily` | date, metric, value (agregat harian, diisi cron) |
| `page_events` | id, anon_id, event, path, utm_*, created_at (dihapus/diringkas setelah 90 hari) |
| `settings` | key, value_json |
| `admins` | id, email, password_hash, totp_secret, last_login_at |

### 12.2 Alur data

1. **Saat belajar:** setiap jawaban → event ke IndexedDB (`client_event_id` = UUID) → mastery lokal di-update langsung (UI instan).
2. **Sinkron:** tiap 30 detik / akhir sesi / saat online kembali, batch event dikirim ke `POST /api/sync`. Server menyimpan (abaikan duplikat via `client_event_id`), menghitung ulang `skill_mastery`, dan mengembalikan state terbaru.
3. **Konflik:** server menang untuk mastery (dihitung dari event), klien menang untuk setting UI lokal.
4. **Agregasi analytics:** cron harian (cron job cPanel/hPanel) mengisi `analytics_daily` → dashboard admin cepat tanpa query berat.
5. **Retensi:** `page_events` mentah dihapus setelah 90 hari (agregat tetap). Akun dihapus → semua data anak terhapus (hard delete) kecuali `orders` (disimpan untuk keperluan pembukuan, dianonimkan).

---

## 13. Spesifikasi API

Base: `/api`. Format JSON. Error: `{ "error": { "code": "STRING", "message": "..." } }`. Auth via cookie session.

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/auth/register` | Daftar ortu |
| POST | `/auth/login` · `/auth/logout` | |
| POST | `/auth/forgot` · `/auth/reset` | |
| GET | `/auth/verify?token=` | Verifikasi email |
| GET | `/me` | Data ortu + anak + entitlement |
| POST/PATCH/DELETE | `/children` · `/children/{id}` | CRUD profil anak |
| POST | `/sync` | Kirim batch event, terima state |
| GET | `/children/{id}/report?range=30d` | Laporan |
| POST | `/activation/redeem` | Tukar kode aktivasi |
| GET | `/entitlement/token` | Token bertanda tangan untuk unduh konten Full |
| POST | `/orders` | Buat order (Fase 6) |
| POST | `/payments/webhook` | Webhook gateway (Fase 6) |
| POST | `/vouchers/check` | Cek voucher |
| POST | `/feedback` | Kirim kritik & saran |
| POST | `/events` | Analytics anonim (landing/UTM) |
| GET | `/settings/public` | Harga, promo, banner |
| `*` | `/admin/*` | Semua endpoint admin (auth admin + 2FA) |

Detail request/response tiap endpoint HARUS ditulis di `backend/API.md` sebelum endpoint diimplementasikan.

---

## 14. Roadmap & Phase Gates

**Aturan emas:** **TIDAK BOLEH lanjut ke fase berikutnya** sebelum *Exit Criteria* fase saat ini terpenuhi **dan** Bimo memberi persetujuan ("Fase X disetujui"). Claude Code mencatat bukti (hasil test, screenshot, skor Lighthouse) di `docs/PROGRESS.md`.

| Fase | Nama | Isi | Exit Criteria |
|---|---|---|---|
| **0** | Setup | Beli domain `studykids.id`; clone repo `medirty/studykidsapp` & pindahkan PRD/CLAUDE.md/`claude-setup` ke dalamnya; setup Git & GitHub (§17.5); struktur folder; setup dev lokal XAMPP (§17.1); tooling (lint, format, test); CI dasar; `CLAUDE.md`, `PROGRESS.md`; **konfigurasi routing model `.claude/` (§16.2)**; install skills/plugin/MCP (§16.4) | `npm run check` & `composer test` hijau di CI; `npm run dev` menjalankan frontend + API + koneksi DB lokal; hello-world tampil di GitHub Pages; `/next` berjalan dan mendelegasikan task bertanda `[opus]` ke subagent architect |
| **1** | Mockup & Brand | Logo final, design tokens, mockup HTML statis semua layar §9.3 (mobile & desktop) di `docs/mockups/` | Bimo menyetujui mockup & logo secara tertulis |
| **2** | Fondasi Frontend | Komponen UI, i18n, routing, Dexie, PWA, speech wrapper, mode lokal | Unit test komponen; Lighthouse ≥ 90; i18n test lolos; install PWA berfungsi |
| **3** | Engine Soal + Demo | Seeded RNG, session engine, adaptif, anti-repeat, mastery, semua format soal, konten **3 mapel demo** kelas 1–6, 2 mini game, laporan ringkas | Generator test (≥ 50 unik, 100% jawaban valid); E2E: anak menyelesaikan sesi offline; **demo dirilis ke GitHub Pages** untuk diuji Bimo & 3–5 anak |
| **4** | Backend & Akun | **Beli hosting (keputusan K8 final)**; DB + migrasi, auth ortu, profil anak, Parent Gate, sinkron, laporan ortu, kode aktivasi, kritik & saran | PHPUnit & E2E lolos; uji keamanan dasar (§15.3) lolos; deploy staging di hosting berhasil |
| **5** | Konten Full + Admin + Marketing | 5 mapel sisanya, semua mini game, gamifikasi lengkap, admin panel, marketing tools | Konten minimum §6.5 terpenuhi (laporan otomatis); admin dashboard angka cocok dengan data uji |
| **6** | Pembayaran | `PAYMENT_SETUP.md`, integrasi gateway (sandbox → production), **logika early bird 100 slot**, voucher, referral, email kuitansi | Semua skenario FR-11 lolos di sandbox; **test konkurensi: 20 order bersamaan saat sisa 3 slot → tepat 3 dapat Rp50.000**; 1 transaksi nyata nominal kecil berhasil end-to-end |
| **7** | Hardening & Launch | Audit performa/aksesibilitas/keamanan, kebijakan privasi & S&K, backup, monitoring, deploy produksi | Checklist launch (§17.4) 100%; 0 bug kritis/tinggi terbuka |
| **8** | Pasca-launch | Update konten berkala, perbaikan dari feedback | Siklus rilis berjalan (§17.3) |

Setiap fase dipecah menjadi **task kecil** (masing-masing ≤ ~1–2 jam kerja / 1 sesi Claude Code) di `docs/PROGRESS.md` dengan checklist.

---

## 15. Testing, QA & Definition of Done

### 15.1 Strategi test

| Jenis | Alat | Cakupan wajib |
|---|---|---|
| Unit | Vitest / PHPUnit | Semua generator, engine, mastery, service backend. Coverage `engine/` & `Services/` ≥ 80% |
| Komponen | Vitest + Testing Library | Semua komponen soal |
| E2E | Playwright (viewport Pixel 5 & iPhone 12, + desktop) | Alur: coba demo → sesi → ringkasan; daftar → tambah anak → sinkron; redeem kode; beli (sandbox) |
| Performa | Lighthouse CI + script cek ukuran bundle | Budget §8.1 — CI gagal jika terlampaui |
| Aksesibilitas | axe-core di Playwright | 0 pelanggaran serius |
| Manual | Bimo + anak penguji | Setiap akhir fase 3, 5, 7 |

### 15.2 Definition of Done (per task)

Sebuah task **selesai** hanya jika:

1. Kode memenuhi AC di PRD.
2. Test ditulis **sebelum/bersama** kode (TDD untuk engine & backend) dan **semua test lolos**.
3. `lint`, `typecheck`, `format` bersih; tidak ada `console.log`/`var_dump` tertinggal.
4. Tidak ada teks hardcode (semua via i18n), tidak ada warna hardcode.
5. Dicek di viewport mobile (360 px).
6. `docs/PROGRESS.md` di-update; commit dengan pesan konvensional (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`).

### 15.3 Checklist keamanan (Fase 4 & 7)

SQL injection, XSS, CSRF, brute force login, IDOR (ortu A tidak bisa akses anak ortu B — WAJIB ada test), webhook palsu, secret tidak bocor di bundle/repo, akses admin tanpa 2FA ditolak.

### 15.4 Proses debugging

Jika ada bug: (1) reproduksi dengan test yang gagal, (2) cari akar masalah (bukan tambal gejala), (3) perbaiki, (4) test lolos, (5) catat di `CHANGELOG.md`. Gunakan skill `systematic-debugging` (superpowers).

---

## 16. Workflow Claude Code

### 16.1 Apakah Claude Pro cukup?

**Cukup, dengan disiplin.** Pro memiliki akses Opus dan Sonnet di Claude Code, tetapi kuotanya berbagi dengan chat Claude dan dibatasi per 5 jam + mingguan; Opus menghabiskan kuota jauh lebih cepat daripada Sonnet. Proyek ini (frontend + PHP sederhana) bisa diselesaikan dengan Pro jika mengikuti aturan di bawah. Jika sering mentok limit di Fase 3 & 5 (fase paling berat), pertimbangkan **upgrade Max sementara 1 bulan** lalu turun lagi.

### 16.2 Kapan Opus, kapan Sonnet — OTOMATIS (PENTING)

**Tujuan:** Bimo **tidak pernah perlu mengetik `/model`**. Pemilihan model diatur oleh konfigurasi di folder `.claude/` (dibuat di Fase 0, file siap pakai sudah disediakan bersama PRD ini).

**Default: Sonnet.** Opus hanya untuk pekerjaan berpikir berat, berdurasi pendek.

> **Fase 0, langkah pertama:** file konfigurasi disediakan di folder `claude-setup/`. Ganti nama folder itu menjadi **`.claude`** (atau minta Claude Code: "rename claude-setup menjadi .claude"), lalu restart Claude Code.

#### Mekanisme otomatis (3 lapis)

| Lapis | Konfigurasi | Efek otomatis |
|---|---|---|
| 1. Mode sesi | `.claude/settings.json` → `"model": "opusplan"` | Saat Claude masuk **plan mode** → Opus. Saat **mengeksekusi** → Sonnet. |
| 2. Subagent ber-model | `.claude/agents/architect.md` & `reviewer.md` (`model: opus`); `implementer.md` & `tester.md` (`model: sonnet`) | Sesi utama (Sonnet) **mendelegasikan** pekerjaan berat ke `architect`/`reviewer` (Opus) dan pekerjaan rutin ke `implementer`/`tester` (Sonnet). |
| 3. Slash command ber-model | `.claude/commands/*.md` dengan field `model:` | Setiap command sudah menentukan modelnya sendiri (tabel di bawah). |

**Tag model di setiap task:** saat `/plan-phase` (Opus) memecah fase menjadi task di `PROGRESS.md`, setiap task diberi tag `[opus]` atau `[sonnet]` berdasarkan tabel pembagian di bawah. `/next` membaca tag itu dan merutekan otomatis.

#### Slash command yang dipakai Bimo

| Command | Model | Fungsi |
|---|---|---|
| `/next` | Sonnet | Ambil task berikutnya dari `PROGRESS.md`. Tag `[opus]` → delegasi ke subagent `architect`; tag `[sonnet]` → dikerjakan langsung. Jalankan test, update progress, commit. |
| `/plan-phase` | Opus | Baca § PRD yang relevan, pecah fase aktif menjadi task kecil bertag model, simpan ke `docs/plans/` & `PROGRESS.md`. |
| `/fix` | Sonnet | Debug sebuah bug (systematic-debugging). **Jika gagal 2×, otomatis eskalasi ke `architect` (Opus).** |
| `/gate` | Opus | Review akhir fase: jalankan semua test, Lighthouse, cek Exit Criteria, tulis laporan untuk persetujuan Bimo. |
| `/cr` | Opus | Analisis Change Request (§18). |

**Aturan eskalasi otomatis (ditulis di `CLAUDE.md`):** sesi utama HARUS memanggil subagent `architect` tanpa diminta jika: (a) task menyentuh skema DB, API, auth, pembayaran, atau engine soal/mastery; (b) perbaikan bug gagal 2×; (c) perlu keputusan arsitektur baru. Semua di luar itu dikerjakan Sonnet.

> **Jangan set** environment variable `CLAUDE_CODE_SUBAGENT_MODEL` — variabel itu menimpa field `model:` di subagent sehingga routing otomatis tidak bekerja.
> Delegasi ke subagent memakai konteks baru (ada sedikit biaya token tambahan), tetapi jauh lebih hemat daripada menjalankan seluruh sesi dengan Opus.

#### Pembagian pekerjaan

| Pakai **Opus 5.5** untuk | Pakai **Sonnet 5.5** untuk |
|---|---|
| Membaca PRD & menyusun rencana fase (writing-plans) | Mengerjakan task yang sudah ada rencananya |
| Desain arsitektur, skema database, desain API | Membuat komponen UI sesuai mockup |
| Desain engine soal: RNG, adaptif, anti-repeat, rumus mastery | Menulis generator soal berdasarkan pola yang sudah ada |
| Debugging bug sulit yang gagal diperbaiki Sonnet 2× | Menulis test, memperbaiki lint/type error |
| Review keamanan (auth, pembayaran, webhook) | Mengisi konten JSON, terjemahan i18n |
| Review akhir fase sebelum phase gate | Refactor kecil, update dokumentasi, CSS |
| Menganalisis Change Request PRD (§18) | Setup tooling, script, CI |

#### Aturan subagent (WAJIB)

| Aturan | Isi |
|---|---|
| Subagent yang boleh dipakai | **Hanya 4 milik project:** `architect`, `reviewer` (Opus); `implementer`, `tester` (Sonnet). Tidak boleh memakai subagent umum (general-purpose, Explore, Plan) atau subagent bawaan plugin. |
| Jumlah | **Maksimal 1 subagent berjalan pada satu waktu.** Tidak ada eksekusi paralel. |
| Eksekusi rencana | Langsung di sesi utama memakai skill `superpowers:executing-plans`. **Tidak memakai** `superpowers:subagent-driven-development` dan `superpowers:dispatching-parallel-agents`. |
| Worktree | **Tidak memakai** `superpowers:using-git-worktrees`. Satu task = satu branch di folder utama (worktree membingungkan di Windows + XAMPP). |
| Kapan delegasi | Sesuai tag task (`[opus]` → `architect`) dan aturan eskalasi di atas. Task `[sonnet]` sebaiknya dikerjakan sesi utama; `implementer`/`tester` dipakai hanya bila task besar dan bisa dipisah dengan jelas. |
| Konflik dengan skill | Jika sebuah skill (superpowers atau lainnya) menyarankan membuat subagent, worktree, atau menjalankan agen paralel, **aturan di tabel ini yang berlaku**. |

### 16.3 Aturan hemat limit (WAJIB)

1. **Satu sesi = satu task** dari `PROGRESS.md`. Setelah task selesai & di-commit → `/clear`.
2. **Mulai sesi cukup dengan mengetik `/next`.** Jangan minta membaca seluruh PRD tiap sesi—cukup bagian yang relevan (sebut nomor §).
3. Gunakan `/compact` jika percakapan panjang; `/cost` atau `/usage` untuk memantau.
4. Rencana disimpan di file (`docs/plans/fase-X.md`) agar tidak perlu dibuat ulang.
5. Jangan biarkan Claude membaca `node_modules`, `vendor`, `dist`, file build/lock besar (sudah diatur di `permissions.deny` pada `.claude/settings.json`).
6. Jalankan `/plan-phase` & `/gate` (Opus) di awal jendela 5 jam; `/next` untuk task `[sonnet]` saat kuota menipis.
7. Hindari menjalankan banyak subagent paralel di Pro (boros kuota); gunakan hanya untuk review akhir fase.
8. Jika limit tercapai: tulis status ke `PROGRESS.md` ("sedang di task X, langkah Y") sebelum berhenti.
9. **Memori project = file di repo, bukan plugin.** Claude mengingat project lewat `CLAUDE.md` (aturan), `docs/PROGRESS.md` (posisi & task), `docs/DECISIONS.md` (keputusan), `docs/plans/` (rencana), dan riwayat Git. File-file ini WAJIB selalu up to date di akhir setiap task/sesi. Tidak memakai claude-mem atau plugin memori lain.

### 16.4 Skills, plugin & MCP — dipasang OTOMATIS oleh Claude Code

Semua tooling dipasang **otomatis oleh Claude Code** mengikuti prosedur **`docs/setup/BOOTSTRAP.md`**. Prosedur ini berjalan sendiri di sesi pertama (status `BELUM`), atau kapan saja hook `doctor` di awal sesi menemukan item yang kurang. Bimo hanya perlu menyetujui setiap instalasi.

| Jenis | Item | Cara dipasang | Tersimpan di |
|---|---|---|---|
| Plugin | **superpowers** (brainstorming, writing-plans, TDD, systematic-debugging, code review, verification) | `claude plugin install superpowers@claude-plugins-official --scope project` | `.claude/settings.json` → `enabledPlugins` |
| Plugin | **frontend-design** | `claude plugin install frontend-design@claude-plugins-official --scope project` | idem |
| Skill | **find-skills** | `npx -y skills add https://github.com/vercel-labs/skills --skill find-skills -a claude-code -y` | `.claude/skills/` |
| Skill | **refactor** | dicari via `npx skills find refactor`; Bimo memilih dari 3 kandidat teratas | `.claude/skills/` |
| MCP | **Playwright**, **Context7**, **Chrome DevTools** | disalin dari `docs/setup/mcp.json` ke `.mcp.json` (root), pakai `cmd /c npx` untuk Windows | `.mcp.json` |
| Hook | `SessionStart` → `node scripts/doctor.mjs --quiet` | ditambahkan ke `.claude/settings.json` | `.claude/settings.json` |
| Plugin | **ponytail** (kode minimal, `/ponytail-review`, `/ponytail-audit`) | `claude plugin marketplace add DietrichGebert/ponytail` lalu `claude plugin install ponytail@ponytail --scope project` | `.claude/settings.json` → `enabledPlugins` + `extraKnownMarketplaces` |
| Skill | **security-review** (dari ECC, selektif) | Salin hanya folder skill `security-review` dari `github.com/affaan-m/ECC` ke `.claude/skills/security-review/` (tanpa hooks/rules/agents/memory). Catat commit sumber di `docs/DECISIONS.md`. | `.claude/skills/` |
| Skill | **graphify** (knowledge graph codebase) | **Dijadwalkan awal Fase 4** (task evaluasi, lihat §16.4.2). Belum dipasang. | — |
| Plugin | ~~ECC paket penuh~~ | **Tidak dipakai.** Bertabrakan dengan aturan subagent (§16.2), keputusan tanpa plugin memori, duplikat superpowers, hooks & rules boros kuota. Hanya skill `security-review` yang diambil. | — |
| Plugin | ~~claude-mem~~ | **Tidak dipakai (keputusan final v1.6).** Alasan: menambah kuota tiap sesi, butuh Bun, lisensi AGPL-3.0 + PolyForm Noncommercial tidak cocok untuk produk komersial. Plugin memori lain juga tidak dipasang. | — |
| MCP | ~~GitHub MCP~~ | Tidak dipakai — `gh` CLI cukup (§17.5) | — |

**Kenapa scope project:** plugin, skill, dan MCP tercatat di repo (`.claude/settings.json`, `.claude/skills/`, `.mcp.json`). Kalau pindah laptop atau install ulang, Claude Code tinggal membaca konfigurasi dan memasang ulang.

**Catatan teknis:** file di `.claude/` dan `.mcp.json` hanya bisa dibuat/diubah oleh Claude Code di laptop. Konfigurasi siap pakai disediakan di `docs/setup/` untuk disalin. Setiap MCP aktif menambah konteks di setiap sesi; jika kuota Pro terasa sempit, nonaktifkan `chrome-devtools` sampai dibutuhkan di Fase 7 (audit performa).

#### 16.4.1 Kapan memakai skill apa (berlaku untuk Opus & Sonnet, sesi utama & subagent)

**Urutan prioritas:** PRD & CLAUDE.md (termasuk DoD) → skill proses superpowers (brainstorming, writing-plans, TDD, systematic-debugging, verification) → skill implementasi (ponytail, frontend-design, security-review). Jika skill bertentangan dengan PRD, **PRD yang berlaku**.

| Situasi | Skill yang WAJIB dipakai |
|---|---|
| Merencanakan fase / task baru | `superpowers:writing-plans` (+ `brainstorming` bila ada keputusan desain) |
| Menulis kode apa pun (fitur, generator, komponen, backend) | `superpowers:test-driven-development` + **`ponytail`** (pilih solusi paling sederhana yang memenuhi AC) |
| Membuat/mengubah UI | `frontend-design` + `ponytail` |
| Bug | `superpowers:systematic-debugging` |
| Sebelum bilang selesai | `superpowers:verification-before-completion` |
| Review akhir task besar & `/gate` | `/ponytail-review` (kode berlebihan/tidak perlu) + `superpowers:requesting-code-review` |
| Auth, sesi, Parent Gate, entitlement, pembayaran, webhook, harga/kuota | **`security-review`** (wajib, oleh `architect` saat implementasi dan `reviewer` saat gate) |
| Menjelajah codebase besar (mulai Fase 4, jika graphify lolos evaluasi) | `graphify` (query graph dulu sebelum membaca banyak file) |

**Batas ponytail (WAJIB):** ponytail **tidak boleh** menjadi alasan untuk menghapus atau melewati test, i18n (teks ID/EN), design token, aksesibilitas (§8.5), validasi server, cek anti-IDOR, atau apa pun yang diwajibkan AC/DoD. "Minimal" artinya tanpa kode, abstraksi, dan dependency yang tidak perlu, bukan tanpa kualitas.

**Subagent:** skill yang relevan dimuat lewat field `skills:` di frontmatter `.claude/agents/*.md` (lihat CR-003 Bagian A4), sehingga subagent Opus/Sonnet otomatis memakainya tanpa perlu diingatkan.

#### 16.4.2 Rencana graphify (evaluasi di awal Fase 4)

- Prasyarat: Python 3.11+ dan `uv` (`winget install astral-sh.uv`), dicek & dipasang lewat BOOTSTRAP.
- Pasang: `uv tool install graphifyy` → `graphify install --project` (scope project).
- **Mode code-only lokal:** tidak memproses PDF/dokumen/gambar (pass semantik memakai token), **tidak** memakai Graphify Cloud / hosted MCP, **tidak** memasang git hook pada awalnya.
- `graphify-out/` WAJIB masuk `.gitignore`.
- Kriteria lolos evaluasi (dicatat di `DECISIONS.md`): pada 3 task eksplorasi yang sama, pemakaian token/jumlah file yang dibaca turun nyata dibanding tanpa graphify, dan tidak ada error di Windows. Jika tidak lolos → uninstall, catat alasannya.

### 16.5 Protokol sesi Claude Code

```
(Bimo cukup mengetik /next — langkah di bawah dijalankan otomatis)
1. Baca CLAUDE.md + docs/PROGRESS.md
2. Ambil 1 task teratas yang belum selesai di fase aktif; lihat tag [opus]/[sonnet]
3. [opus] → delegasi ke subagent architect; [sonnet] → kerjakan langsung. Jika ada keputusan baru → minta konfirmasi Bimo
4. Tulis test → implementasi → jalankan test & lint
5. Verifikasi (verification-before-completion): jalankan perintah, lihat hasil nyata
6. Update PROGRESS.md, commit
7. Laporkan ringkas: apa yang selesai, bukti test, task berikutnya
```

**Jika task terblokir tindakan manual Bimo (item `B*` di `PROGRESS.md`) — CR-002:** Bimo tidak berlatar teknis, jadi Claude tidak berhenti di "Bimo harus melakukan X". Urutannya:

1. Jelaskan dengan bahasa sederhana: apa yang kurang dan kenapa dibutuhkan.
2. Cek kondisi nyata di laptop dulu (mis. `winget list`, lokasi program) supaya langkah pasti cocok.
3. Coba kerjakan sendiri dengan izin Bimo per instalasi.
4. Jika ditolak sistem izin atau butuh hak admin: **jangan mengakali penolakan.** Beri langkah klik-demi-klik bernomor, satu perintah per langkah, lengkap dengan tampilan yang diharapkan.
5. Setelah Bimo selesai: verifikasi sendiri (mis. `node --version`, `node scripts/doctor.mjs`), centang item `B*` di `PROGRESS.md`, lalu lanjut ke task.

### 16.6 Aturan & larangan coding

**Wajib:**

- Ikuti PRD & struktur folder. Ikuti pola yang sudah ada sebelum membuat pola baru.
- TypeScript `strict`. Fungsi kecil (≤ 40 baris), satu tanggung jawab, nama jelas (Inggris untuk kode, Indonesia boleh di komentar/dokumen).
- Logika murni (engine, generator, mastery) terpisah dari UI agar mudah dites.
- Konten adalah data (JSON), bukan kode.
- Desain dulu, baru kode, untuk mengurangi refactor.

**Dilarang:**

- Menambah dependency baru tanpa alasan tertulis di `DECISIONS.md` (cek ukuran bundle dulu).
- Mengubah skema DB tanpa migrasi Phinx.
- Mengubah atau melewati PRD diam-diam; menambah fitur di luar PRD.
- Menghapus/men-skip test agar CI hijau.
- Hardcode secret, teks UI, warna, harga.
- Refactor besar di luar task (catat sebagai saran di `DECISIONS.md` saja).
- Lanjut fase tanpa persetujuan Bimo.
- Memakai materi/logo Cambridge atau aset tanpa lisensi jelas.
- Menambahkan pelacak pihak ketiga di area anak.

---

## 17. Environment, Deployment & Update Berkala

### 17.1 Environment

| Env | Tempat | Isi |
|---|---|---|
| **Local** | Laptop Bimo (Windows) — MariaDB 11.8 (service) + PHP 8.4 + Node, dijalankan dengan `npm run dev` | Pengembangan |
| **Preview** | **GitHub Pages** — `https://medirty.github.io/studykidsapp/` (mode lokal, tanpa backend) | Demo untuk diuji anak/teman |
| **Staging** | `staging.studykids.id` + DB terpisah | Uji backend & pembayaran sandbox |
| **Production** | Hostinger, domain `studykids.id`, SSL gratis (Let's Encrypt) | Live |

#### Setup dev lokal (keputusan K9)

**Keputusan (CR-004):** database lokal memakai **MariaDB 11.8 standalone** sebagai service Windows, versi yang sama dengan Hostinger dan CI. XAMPP tidak dipakai lagi (MariaDB 10.4 bawaannya sudah tidak didukung dan berbeda versi dengan produksi). Lihat data manual dengan **HeidiSQL** (ikut terinstall).

| Komponen | Cara |
|---|---|
| Database | MariaDB 11.8 (MSI dari mariadb.org), service `MariaDB` otomatis menyala, port 3306. DB `studykids_dev` & `studykids_test`, user `studykids` (bukan root), dibuat dengan `scripts/db-setup.ps1`. |
| PHP | **`C:\php-8.4`** — install bersih PHP 8.4 terbaru (VS17 x64 Non Thread Safe dari windows.php.net), bukan PHP 8.2 bawaan XAMPP. Folder lama `C:\php-8.4.2` tidak dipakai (berisi `php_pdo_mysql.dll` milik PHP 8.2 sehingga error). Aktifkan ekstensi di `php.ini`: `pdo_mysql`, `mbstring`, `openssl`, `curl`, `intl`, `fileinfo`, `zip`, `sodium`. PATH sistem **tidak diubah** (perintah `php` tetap XAMPP 8.2); project memanggil PHP lewat `PHP_BIN=C:\php-8.4\php.exe` di `backend/.env` & script npm. Folder `C:\Program Files\MariaDB 11.8\bin` ada di PATH user (script project tidak bergantung padanya; `DB_CLIENT_BIN` opsional). |
| Composer & Node | Install Composer (Windows installer) & Node.js LTS. Git for Windows. |
| Menjalankan app | `npm run dev` di root → menjalankan bersamaan (pakai `concurrently`): Vite di `localhost:5173` + API `php -S localhost:8000 -t backend/public`. Vite mem-*proxy* `/api` → `localhost:8000`, jadi tidak ada masalah CORS dan URL sama seperti produksi. |
| Akses DB oleh Claude Code | Lewat **CLI** (`mariadb -u studykids -p studykids_dev -e "..."`), Phinx (`migrate`, `seed`), dan script `npm run db:reset`. **Tanpa MCP database** — CLI lebih hemat token & tidak menambah konteks setiap sesi. |
| Lihat data manual | HeidiSQL (ikut installer MariaDB). phpMyAdmin/XAMPP tidak dipakai. |
| Konfigurasi | `backend/.env` (dari `.env.example`): `DB_HOST=127.0.0.1`, `DB_NAME=studykids_dev`, `DB_USER=studykids`, `DB_PASS=...`. |

**Status laptop Bimo (dicek 21 Nov 2026):**

| Program | Status | Tindakan |
|---|---|---|
| Node.js v22.12.0 · npm 11.0.0 | OK | — (memenuhi syarat Vite) |
| Git 2.47.1 | OK | — |
| Composer 2.8.4 | OK | — |
| PHP 8.4.28 NTS x64 di `C:\php-8.4` | OK — 8 ekstensi wajib aktif, tanpa warning | Project memanggil `PHP_BIN=C:\php-8.4\php.exe` (perintah `php` di PATH tetap XAMPP 8.2) |
| MariaDB 11.8 (service) | Dipasang lewat CR-004 | `npm run doctor` hijau |
| GitHub CLI 2.105 | OK — login `medirty` | — |
| Claude Code 2.1.330 | OK — dipakai lewat tab **Code** di Claude Desktop | — |
| Plugin/skill/MCP Claude | Belum diverifikasi | Otomatis lewat `docs/setup/BOOTSTRAP.md` (§16.4) |
| Docker, WSL, PostgreSQL | Terpasang | Tidak dipakai di project ini |

**Fase 0, task pertama:** Claude Code membuat `docs/SETUP_LOCAL.md` (langkah klik-demi-klik untuk Bimo) dan script `scripts/doctor` yang mengecek versi PHP/Node/Composer, koneksi MySQL, dan port 5173/8000 bebas.

> Alternatif yang juga baik (tidak wajib): Laragon. Docker tidak dipakai karena lebih berat di laptop dan tidak diperlukan untuk stack ini.

### 17.2 Hosting & deploy

#### Keputusan hosting (K8): **Hostinger**

| Kriteria | Hostinger | IDwebhost |
|---|---|---|
| Data center Indonesia | Ya | Ya |
| PHP 8.2+ & MySQL | Ya | Ya |
| Database | MariaDB 11.8 | — |
| SSH & Git deploy | Ya (Premium ke atas) | Tergantung paket |
| Cron job | Ya | Ya |
| Panel | hPanel | cPanel |
| Opsi Node.js di masa depan | Ya (Business/Cloud) | Terbatas |
| SSL gratis | Ya | Ya |

**Rekomendasi:** **Hostinger Business Web Hosting** (backup harian + ruang tumbuh); minimal **Premium**. Saat checkout pastikan: data center Indonesia, SSH aktif. Di hPanel set **PHP 8.4** (sama dengan lokal). Domain `studykids.id` boleh dibeli di mana saja lalu diarahkan (DNS) ke hosting.

**Kenapa tidak mengganggu development:**

- Fase 0–3 berjalan 100% di lokal + GitHub Pages; hosting baru dibutuhkan di **Fase 4** (staging).
- Kode hosting-agnostic: tidak ada fitur khusus hosting. Semua pengaturan deploy ada di GitHub Secrets (`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`, `DEPLOY_METHOD=ssh|ftp`). Pindah ke IDwebhost = ganti secrets saja.

#### Deploy

- Database produksi = MariaDB Hostinger. Saat membuat DB di hPanel (Fase 4), cek `SELECT VERSION();` di phpMyAdmin hosting. Jika versi mayor berubah dari 11.8, samakan image CI (`mariadb:<versi>`) dan catat di DECISIONS. Koneksi app selalu memakai UTC, utf8mb4_unicode_ci, dan sql_mode ketat (CR-004).
- Build frontend → upload `dist/` ke `public_html/`.
- Backend → `public_html/api/` (hanya `index.php` + `.htaccess`), source & `vendor/` & `.env` di luar `public_html`.
- Deploy otomatis via GitHub Actions (SSH/rsync bila paket hosting mendukung SSH; jika tidak, FTP deploy action) saat membuat **tag rilis** (`v1.2.0`), bukan setiap push.
- Migrasi DB dijalankan lewat SSH (`vendor/bin/phinx migrate`) atau endpoint admin terproteksi bila tanpa SSH.
- Backup: backup harian otomatis dari hosting + export DB mingguan (cron) ke email/penyimpanan.
- Langkah lengkap di `docs/DEPLOY.md` (dibuat di Fase 4).

### 17.3 Update sistem secara berkala

| Apa | Frekuensi | Caranya |
|---|---|---|
| Dependency (npm/composer) | Mingguan (otomatis PR) | **Dependabot**; CI wajib hijau sebelum merge |
| Patch keamanan | Segera | Dependabot security alerts |
| Konten soal baru | 2 minggu sekali | Tambah JSON/generator → rilis minor |
| Rilis app | Saat ada perubahan | Tag versi semver → deploy otomatis; PWA menampilkan "versi baru tersedia" |
| Review analytics & feedback | Bulanan | Masukkan temuan ke `CHANGE_REQUESTS.md` |

### 17.4 Checklist launch

Domain + SSL aktif · kebijakan privasi & S&K · backup terjadwal · error logging aktif (log PHP + endpoint error klien) · Lighthouse ≥ 90 · uji di 3 HP asli · pembayaran production diuji · akun admin pakai 2FA · `.env` production aman · disclaimer Cambridge tampil.

### 17.5 Git & GitHub (repo `medirty/studykidsapp`)

**Setup (Fase 0):**

1. Clone repo ke laptop. Isi folder kerja StudyKids saat ini (PRD.md, CLAUDE.md, `claude-setup/` → `.claude/`, `docs/brand/`) dipindahkan ke root repo lalu di-commit pertama kali.
2. `.gitignore` WAJIB berisi: `node_modules/`, `vendor/`, `dist/`, `.env`, `backend/.env`, `*.log`, `.DS_Store`, `coverage/`, `playwright-report/`.
3. **Repo PUBLIC (final).** Preview demo memakai **GitHub Pages** (gratis). Konsekuensi & aturan wajib:
   - **Secret tidak boleh pernah masuk repo.** Hanya `.env.example` (tanpa nilai asli). Aktifkan *Settings → Code security → Secret scanning & Push protection* (gratis untuk repo public) supaya push yang berisi key/password otomatis ditolak.
   - **Tambahkan file `LICENSE` berisi "All rights reserved"** (bukan lisensi open source). Repo public tanpa lisensi terbuka artinya orang boleh melihat kode, tapi tidak boleh memakai/menyalinnya secara legal.
   - Jangan commit data asli: dump database, data pengguna, file export CSV, screenshot berisi data anak.
   - Keamanan tidak boleh bergantung pada kode yang "tersembunyi": semua pengecekan (entitlement, admin, harga, kuota early bird) tetap di server.
   - **Konten Full ikut terlihat di repo public.** Untuk v1 ini diterima (harga murah, generator tetap butuh app untuk dipakai). Di awal Fase 5 Bimo memutuskan: tetap begitu, atau memindahkan konten Full (5 mapel non-demo + unit ≥ 3) ke repo private terpisah `studykidsapp-content` yang ditarik saat build lewat deploy key.
4. Pengaturan Pages: *Settings → Pages → Source: GitHub Actions* (workflow `deploy-pages.yml`).

**Base path (penting untuk build):** di GitHub Pages app berjalan di sub-path `/studykidsapp/`, sedangkan di produksi di root `studykids.id/`. Jadi `vite.config.ts` HARUS membaca `VITE_BASE` dari env: `/studykidsapp/` untuk build Pages, `/` untuk build produksi & Cloudflare Pages. Semua link/aset memakai path relatif terhadap base (tidak boleh hardcode `/`). Service worker PWA juga memakai base ini.

**Branch & alur kerja:**

| Aturan | Isi |
|---|---|
| `main` | Selalu stabil & lolos CI. Dilindungi: tidak boleh push langsung dan tidak boleh force push; merge hanya lewat PR dengan CI hijau. |
| Branch kerja | Satu branch per task: `feat/f3-mcq-component`, `fix/sync-duplicate`, `docs/...` (prefix `f<nomor fase>`). |
| PR | Dibuat oleh Claude Code (`gh pr create`) setelah task selesai. Deskripsi berisi: task dari `PROGRESS.md`, ringkasan perubahan, bukti test. **Di-merge otomatis oleh Claude** jika memenuhi aturan auto-merge di bawah; selain itu menunggu Bimo. |
| Commit | Conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`). |
| Rilis | Tag semver (`v0.3.0` = demo Fase 3, `v1.0.0` = launch). Tag memicu deploy ke hosting. |
| Phase gate | Akhir fase ditandai tag `phase-N-approved` setelah Bimo menyetujui. |

#### Aturan auto-merge

Claude **langsung merge tanpa bertanya** (`gh pr merge <nomor> --squash --delete-branch`, lalu `git switch main && git pull`) jika **SEMUA** syarat ini terpenuhi:

1. Acceptance criteria task terpenuhi dan perintah verifikasi (lint, typecheck, test) sudah dijalankan dengan hasil **lolos**, output ditampilkan di laporan/PR.
2. **CI hijau** di PR. Sebelum CI ada (sebelum T0.10 selesai): semua pemeriksaan lokal yang relevan lolos.
3. Isi PR hanya untuk task itu (tidak ada perubahan di luar scope).
4. Tidak ada pertanyaan terbuka atau temuan `reviewer` yang belum diselesaikan.
5. PR **bukan** kategori "wajib review Bimo" di bawah.

**Wajib review Bimo (Claude bertanya dulu, tidak auto-merge):**

| Kategori | Contoh |
|---|---|
| Aturan & dokumen inti | Perubahan `PRD.md`, `CLAUDE.md`, isi `.claude/` (kecuali yang berasal dari CR yang sudah disetujui Bimo) |
| Skema & data | Migrasi database baru |
| Keamanan & uang | Auth, sesi, Parent Gate, entitlement, pembayaran, webhook, harga/kuota early bird |
| Deploy & rahasia | Workflow deploy ke hosting, pengaturan secrets |
| Visual yang harus dilihat | Mockup & logo (Fase 1), perubahan besar tampilan |
| Phase gate | Persetujuan fase selalu oleh Bimo ("Fase X disetujui") |
| Dependabot | Update **major**. Update patch/minor dengan CI hijau boleh auto-merge. |

**Setelah auto-merge:** laporan akhir task menyebut "PR #N sudah di-merge otomatis" + ringkasan. Jika Bimo ingin membatalkan: `Batalkan PR #N` → Claude membuat PR revert.

**Skill `superpowers:finishing-a-development-branch`:** jangan tampilkan pilihan merge/PR/simpan/buang ke Bimo. Ikuti aturan auto-merge ini: PR lalu auto-merge, atau PR lalu tanya Bimo bila termasuk kategori wajib review.

**Setelah CI & branch protection aktif (T0.10 + B8):** gunakan `gh pr merge <nomor> --squash --auto --delete-branch` agar GitHub yang merge begitu CI hijau. Syarat: Settings → General → centang **Allow auto-merge**.

**GitHub Secrets** (ditambahkan saat dibutuhkan, tidak pernah di kode): `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`, `DEPLOY_METHOD`, `DEPLOY_SSH_KEY` atau `DEPLOY_FTP_PASSWORD` (Fase 4); `MIDTRANS_SERVER_KEY` dan lainnya disimpan hanya di `.env` server, bukan di GitHub (Fase 6).

**Otomatisasi repo:** Dependabot (npm, composer, github-actions; mingguan), CI wajib di setiap PR, Issues dipakai untuk bug dari kritik & saran (label `bug`, `konten`, `ide`).

**Akses Claude Code:** install GitHub CLI (`gh`) dan login (`gh auth login`) di Fase 0 agar Claude bisa membuat branch, PR, dan mengecek status CI. GitHub MCP tidak diperlukan.

---

## 18. Change Management (Update PRD / Fitur Baru)

Jika ada perubahan PRD atau fitur baru saat development sudah berjalan:

1. **Catat** di `docs/CHANGE_REQUESTS.md`: ID (CR-001), deskripsi, alasan, prioritas (wajib/bagus-jika-ada).
2. **Analisis dampak** (Opus): fitur/file/tabel yang terpengaruh, perkiraan jumlah task, risiko, apakah mengganggu fase aktif.
3. **Keputusan Bimo:** terima sekarang / jadwalkan di fase tertentu / tolak.
4. **Update PRD:** naikkan versi (1.0 → 1.1), tulis ringkasan perubahan di bagian "Riwayat Versi" di bawah, update §/FR terkait.
5. **Update `PROGRESS.md`:** tambah task baru ke fase yang ditentukan.
6. **Kerjakan** seperti task biasa (test dulu, DoD berlaku). Jika menyentuh skema DB → migrasi baru, jangan ubah migrasi lama.
7. **Regresi:** jalankan seluruh test suite sebelum merge.

**Aturan:** fitur baru TIDAK BOLEH menyela fase aktif kecuali bug kritis. Claude Code yang menemukan kebutuhan di luar PRD **berhenti dan bertanya**, lalu membuat CR jika disetujui.

---

## 19. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Volume konten 8 mapel × 6 kelas sangat besar | Launch tertunda | Generator untuk mapel eksak; launch Full boleh dengan konten minimum §6.5 lalu ditambah berkala |
| Limit Claude Pro | Pengerjaan lambat | Aturan §16.3; upgrade sementara jika perlu |
| Klaim "Cambridge" bermasalah | Hukum/reputasi | Aturan §6.1 |
| Pendaftaran payment gateway lama | Tidak bisa jualan | Kode aktivasi manual + transfer/QRIS manual dulu (K6) |
| Web Speech tidak seragam di semua HP | Fitur suara tidak jalan | Progressive enhancement + fallback teks |
| Shared hosting lambat saat ramai | UX buruk | Logika di klien, agregat harian, cache statis, bisa pindah ke paket cloud tanpa ubah kode |
| Repo public: secret bocor atau kode disalin | Keamanan / hak cipta | Push protection + secret scanning, `LICENSE` all rights reserved, semua pengecekan di server (§17.5) |
| Konten Full bisa "dibajak" dari bundle atau repo public | Kehilangan penjualan | Konten Full di chunk terpisah dengan token; terima bahwa proteksi 100% tidak mungkin, harga murah mengurangi motivasi membajak |

---

## 20. Pertanyaan Terbuka (dijawab Bimo, lalu PRD di-update)

Sudah terjawab di v1.1: nama & domain (`studykids.id`), harga (Rp50rb untuk 100 pertama → Rp100rb), demo (3 mapel, unit 1–2), hosting (Hostinger), dev lokal (XAMPP via CLI), routing model (otomatis), repo (`medirty/studykidsapp`, public → preview di GitHub Pages).

Masih terbuka:

0. (Awal Fase 5) Konten Full tetap di repo public atau dipindah ke repo private terpisah? (§17.5)
1. Apakah "StudyKids" perlu didaftarkan sebagai merek di PDKI? (Disarankan cek ketersediaan merek sebelum marketing besar.)
2. Apakah ingin suara rekaman manusia untuk kelas 1–2 di masa depan (di luar scope v1)?
3. Persetujuan konsep maskot Kiko (dijawab saat review mockup Fase 1).

---

## 21. Lampiran: Repo & Library Rujukan

| Repo / Library | Kegunaan |
|---|---|
| `sveltejs/svelte`, `vitejs/vite` | Frontend |
| `dexie/Dexie.js` | IndexedDB |
| `vite-pwa/vite-plugin-pwa` | PWA |
| `isaacHagoel/svelte-dnd-action` | Drag & drop soal (cek dukungan Svelte 5) |
| `leeoniya/uPlot` | Grafik ringan |
| `catdad/canvas-confetti` | Efek perayaan |
| `slimphp/Slim`, `cakephp/phinx`, `PHPMailer/PHPMailer` | Backend |
| `Midtrans/midtrans-php` | Integrasi pembayaran (Fase 6) |
| `microsoft/playwright`, `vitest-dev/vitest`, `GoogleChrome/lighthouse-ci`, `dequelabs/axe-core` | Testing |
| `obra/superpowers`, `vercel-labs/skills` (find-skills) | Workflow Claude Code |
| `microsoft/playwright-mcp`, `upstash/context7`, `ChromeDevTools/chrome-devtools-mcp` | MCP |
| `SamKirkland/FTP-Deploy-Action` | Deploy via FTP bila hosting tanpa SSH |

> Sebelum memakai library, Claude Code HARUS mengecek versi terbaru, lisensi (MIT/Apache/BSD), dan ukuran bundle-nya, lalu mencatat di `DECISIONS.md`.

---

## Riwayat Versi

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 21 Nov 2026 | Versi awal dari dokumen ide Bimo |
| 1.1 | 21 Nov 2026 | Harga final: Rp50.000 untuk 100 pembeli pertama, lalu Rp100.000 (+ aturan teknis kuota, §4.2, FR-11, Fase 6). Demo final: 3 mapel, unit 1–2. Domain `studykids.id`. Logo baru bergaya fun dengan maskot Kiko + palet warna baru (§9.2, §9.4). Routing Opus/Sonnet otomatis via `.claude/` (§16.2). Dev lokal XAMPP via CLI (§17.1). Hosting: Hostinger (§17.2). Keputusan K8–K10. |
| 1.2 | 21 Nov 2026 | Repo `github.com/medirty/studykidsapp` ditetapkan (§1, §11, Fase 0). Aturan Git & GitHub baru (§17.5): branch protection, PR per task, tag rilis, secrets, base path Vite `/studykidsapp/` untuk GitHub Pages, catatan repo private vs public. Staging `staging.studykids.id`. GitHub MCP diganti `gh` CLI. |
| 1.3 | 21 Nov 2026 | Repo dipastikan **public** → preview di GitHub Pages. Aturan repo public: push protection & secret scanning, `LICENSE` all rights reserved, larangan commit data asli, keputusan lokasi konten Full di awal Fase 5 (§17.5, §19, §20). |
| 1.4 | 21 Nov 2026 | Hasil cek laptop Bimo dicatat di §17.1. PHP dinaikkan ke **8.4** (8.2 habis masa patch keamanan Des 2026) memakai `C:\php-8.4`; kode tetap kompatibel 8.2+. Tambah langkah install `gh`, Claude Code CLI, dan `mysql` di PATH. |
| 1.5 | 21 Nov 2026 | §16.4 ditulis ulang: semua plugin/skill/MCP dipasang **otomatis** oleh Claude Code lewat `docs/setup/BOOTSTRAP.md` (scope project), hook `SessionStart` + `doctor`. claude-mem tidak dipasang default (kuota, Bun, lisensi). PHP dipanggil via `PHP_BIN`, PATH sistem tidak diubah. |
| 1.6 | 21 Nov 2026 | claude-mem **tidak dipakai** (final). Memori project dipegang file repo: CLAUDE.md, PROGRESS.md, DECISIONS.md, docs/plans, Git (§16.3 butir 9, §16.4, §21). |
| 1.7 | 21 Nov 2026 | CR-001: aturan subagent (hanya 4 subagent project, maks. 1 bersamaan, eksekusi inline, tanpa worktree; §16.2) dan aturan auto-merge PR dengan daftar kategori wajib review Bimo (§17.5). |
| 1.8 | 22 Nov 2026 | CR-002: protokol bantuan langsung saat task terblokir tindakan manual Bimo — jelaskan sederhana, cek kondisi nyata, coba sendiri, jika diblokir beri langkah klik-demi-klik, lalu verifikasi (§16.5). |
| 1.9 | 23 Nov 2026 | CR-003: tambah plugin **ponytail** (kode minimal) dan skill **security-review** (selektif dari ECC); **graphify** dijadwalkan evaluasi di awal Fase 4; ECC paket penuh tidak dipakai. Tabel "kapan memakai skill apa" + batas ponytail (§16.4.1–16.4.2). |
| 1.10 | 23 Nov 2026 | CR-004: XAMPP diganti **MariaDB 11.8 standalone** (sama dengan Hostinger & CI); CI pindah dari MySQL 8.0 ke `mariadb:11.8`; koneksi DB mengatur sql_mode/UTC/collation sendiri; `scripts/db-setup.ps1`; HeidiSQL pengganti phpMyAdmin. Alur deploy tidak berubah. |
