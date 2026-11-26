# Mockup StudyKids (Fase 1)

Galeri: [`index.html`](index.html) · Pages: `https://medirty.github.io/studykidsapp/mockups/`

## Checklist 11 layar (PRD §9.3)

Setiap file diuji otomatis di **360 px (mobile) & 1280 px (desktop)**: tanpa scroll horizontal + axe-core 0 pelanggaran serius/kritis (`npm run test:e2e`, 78 lolos).

| # | Layar | File | Mobile | Desktop |
|---|---|---|---|---|
| 1 | Landing | `landing` | ✅ | ✅ |
| 2 | Pilih kelas/profil | `pilih-kelas` | ✅ | ✅ |
| 3 | Beranda (1–2, 5–6) | `beranda`, `beranda-besar` | ✅ | ✅ |
| 4 | Peta belajar | `peta-belajar` | ✅ | ✅ |
| 5a | Soal mcq/input/tf/tap/listen | `soal-mcq`, `soal-mcq-besar`, `soal-input`, `soal-tf`, `soal-tap`, `soal-listen` | ✅ | ✅ |
| 5b | Soal dragdrop/match/order/draw | `soal-dragdrop`, `soal-match`, `soal-order`, `soal-draw` | ✅ | ✅ |
| 6 | Feedback benar/salah | `feedback-benar`, `feedback-salah` | ✅ | ✅ |
| 7 | Ringkasan sesi | `ringkasan` | ✅ | ✅ |
| 8 | Mini game Balon Angka | `game-balon`, `-pause`, `-hasil` | ✅ | ✅ |
| 9 | Laporan anak & ortu | `laporan`, `-belum`, `laporan-ortu`, `-ortu-demo` | ✅ | ✅ |
| 10 | Parent Gate, paywall, langganan, saran | `parent-gate`, `paywall`, `langganan`, `saran` | ✅ | ✅ |
| 11 | Admin | `admin-login`, `-dashboard`, `-penjualan`, `-marketing` | ✅ | ✅ |

## Hasil review T1.15 (25 Nov 2026)

- Tautan/gambar internal di 36 halaman dicek skrip: **2 gambar rusak ditemukan & diperbaiki** (`admin-marketing`, `saran`; axe tidak menangkap ini). Semua halaman ada di galeri, punya `<title>`, `<main>`, toggle EN, `alt` pada gambar.
- Fokus terlihat (`:focus-visible`), target sentuh via `--tap-min`, status = ikon + teks (bukan warna saja), `prefers-reduced-motion` dihormati (animasi Kiko + transisi).
- **Belum dicek visual di browser** (browser MCP memblokir `file:`) — Bimo cukup membuka galeri di Pages saat B11.

## Keputusan terbuka untuk Bimo

1. ~~Warna English~~ — diputuskan Bimo 25 Nov 2026: `#7C3AED` (5,70:1), PRD §9.2 diperbarui.

## Komponen yang dibawa ke Fase 2

Header aplikasi + toggle ID/EN · Tombol (primer/sekunder, ≥ 72 px kelas 1–2) · Kartu · Chip/lencana status (ikon+teks) · Bar progres & bintang · Kartu mapel berwarna · Kartu unit di peta (selesai/tersedia/terkunci) · Pilihan jawaban (terpilih = border + ✓) · Keypad angka · Kartu seret/pasangan/urut + alternatif ketuk · Kanvas gambar + palet · Panel feedback Kiko (benar/salah, reduced-motion) · Kartu/grafik laporan (SVG) · Modal Parent Gate · Kartu paket/harga · Form saran · Tata letak admin (tabel, kartu angka, filter) · Kiko 4 ekspresi + avatar.

## Mockup v2 — CR-008 "ceria penuh warna" (T3.2, 26 Nov 2026) — menunggu B12

File: `landing-v2`, `beranda-v2` (kelas 1–2), `beranda-besar-v2` (kelas 5–6), gaya `assets/mockup-v2.css` (token teks per mapel di sana = **usulan** untuk T3.8). Ilustrasi: `../brand/subject/subject-*.svg` (8 buah, tanpa buku/toga/pensil/papan tulis/apel/ABC/bola lampu; English = balon bicara, Science = tabung reaksi).

- **Kelas 1–2:** band Sunny (sapaan + Kiko yang bisa disentuh), band Teal (statistik), ubin penuh warna 148 px dengan ilustrasi 72 px; badge Gratis/Terkunci **di dalam ubin** (ikon + teks, L-5). Ketuk ubin = nama mapel dibacakan (CR-008 no. 6).
- **Kelas 5–6:** lebih kalem — baris ringkas, hanya chip ikon yang berwarna, Kiko kecil, tanpa 🔊 besar.
- **Landing:** hanya hero (band Sunny) dan ubin mapel yang ceria; keunggulan, harga, FAQ tetap tenang.
- **Animasi Kiko:** loncat kecil saat disentuh; dimatikan oleh `prefers-reduced-motion`.

### Kontras (rumus WCAG, sama dengan `contrast.test.ts`)

| Mapel | Ubin | Teks ubin | Teks/ubin | Ilustrasi utama/ubin | Aksen/ubin |
|---|---|---|---|---|---|
| Math | #2459D6 | putih | 6,04 | putih 6,04 | sunny 3,93 |
| English | #7C3AED | putih | 5,70 | putih 5,70 | sunny 3,71 |
| Science | #22A55B | Ink | 5,44 | Ink 5,44 | putih 3,18 |
| Global Perspectives | #0EA5E9 | Ink | 6,24 | Ink 6,24 | putih 2,77* |
| Wellbeing | #EC4899 | Ink | 4,90 | Ink 4,90 | putih 3,53 |
| Art & Design | #FF8A1F | Ink | 7,34 | Ink 7,34 | putih 2,36* |
| Music | #F43F5E | Ink | 4,71 | Ink 4,71 | putih 3,67 |
| Computing | #14B8A6 | Ink | 6,95 | Ink 6,95 | putih 2,49* |

Ilustrasi utama (bentuk/garis pengenal) selalu ≥ 3:1. *Aksen putih di GP, Art, Computing hanya isian dekoratif di dalam garis Ink, sehingga ilustrasi tetap terbaca tanpa aksen.
