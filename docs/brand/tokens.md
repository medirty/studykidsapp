# Design tokens — kontras & font

Sumber: `frontend/src/styles/tokens.css` (PRD §9.2). Rasio dihitung rumus WCAG 2.1 dan dijaga oleh `frontend/tests/unit/contrast.test.ts` (gagal jika token diubah dan kontras turun).
Aturan: teks biasa ≥ 4,5:1; teks besar (≥ 24 px, atau ≥ 18,66 px tebal) & ikon/aksen ≥ 3:1.

## Teks & latar

| Teks | Latar | Rasio | Dipakai untuk |
|---|---|---|---|
| Ink | Background | 16,45 | teks utama |
| Ink | Surface | 17,30 | teks di kartu |
| Ink Soft `#5A5278` | Background | 6,85 | teks sekunder |
| Ink Soft | Surface | 7,21 | teks sekunder di kartu |
| Ink | Primary (oranye) | 6,12 | tombol utama |
| Ink | Sunny | 11,26 | bintang, lencana |
| Ink | Teal | 7,98 | aksen |
| Ink | Bubblegum | 9,01 | aksen lembut |
| Putih | Ink | 17,30 | tombol/bar gelap |
| Error | Surface | 4,51 | pesan error di kartu (selalu + ikon) |
| Error | Background | 4,29 | **hanya teks besar/tebal** |
| Success | Surface / Background | 3,18 / 3,02 | **hanya ikon ✓ / teks besar**; teks biasa pakai Ink |

## Warna mapel (latar kartu/ikon)

| Mapel | Hex | Ink di atasnya | Putih di atasnya | Teks yang dipakai |
|---|---|---|---|---|
| Math | `#2459D6` | 2,86 | 6,04 | putih |
| English | `#7C3AED` | 4,31 | 5,70 | putih |
| Science | `#22A55B` | 5,44 | 3,18 | Ink |
| GP | `#0EA5E9` | 6,24 | 2,77 | Ink |
| Wellbeing | `#EC4899` | 4,90 | 3,53 | Ink |
| Art | `#FF8A1F` | 7,34 | 2,36 | Ink |
| Music | `#F43F5E` | 4,71 | 3,67 | Ink |
| Computing | `#14B8A6` | 6,95 | 2,49 | Ink |

**Keputusan Bimo (25 Nov 2026):** English diganti dari `#8B5CF6` (putih 4,23:1) ke `#7C3AED` (putih 5,70:1), lolos AA. PRD §9.2 diperbarui.

## Font (self-host)

| Berkas | Isi | Ukuran |
|---|---|---|
| `frontend/public/fonts/baloo2-latin.woff2` | Baloo 2 variabel (400–800), subset latin | 33 KB |
| `frontend/public/fonts/nunito-latin.woff2` | Nunito variabel (200–1000), subset latin | 39 KB |

Total font ±72 KB, dimuat lewat `@font-face` (`font-display: swap`), **tidak** masuk hitungan JS/CSS awal.
