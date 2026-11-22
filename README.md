# StudyKids

Web app belajar untuk SD kelas 1–6 (kurikulum terinspirasi Cambridge Primary), dwibahasa ID/EN, mobile-first. Maskot: Kiko. Domain: `studykids.id`.

> Status: **Fase 0 — Setup**. Lihat [docs/PROGRESS.md](docs/PROGRESS.md).

## Dokumen utama

| Dokumen | Isi |
|---|---|
| [PRD.md](PRD.md) | Sumber kebenaran produk, roadmap, arsitektur |
| [CLAUDE.md](CLAUDE.md) | Aturan kerja untuk Claude Code |
| [docs/PROGRESS.md](docs/PROGRESS.md) | Status fase & task |
| [docs/SETUP_LOCAL.md](docs/SETUP_LOCAL.md) | Setup lingkungan dev lokal (Windows + XAMPP MySQL) |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Log keputusan (ADR singkat) |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Riwayat perubahan |
| [docs/CHANGE_REQUESTS.md](docs/CHANGE_REQUESTS.md) | Permintaan perubahan PRD |
| [docs/ASSET_LICENSES.md](docs/ASSET_LICENSES.md) | Lisensi aset (logo, font, gambar) |

## Mulai cepat

1. Ikuti [docs/SETUP_LOCAL.md](docs/SETUP_LOCAL.md).
2. Salin `.env.example` ke `.env` dan `backend/.env.example` ke `backend/.env`, lalu isi nilainya (jangan di-commit).
3. Cek lingkungan: `node scripts/doctor.mjs`

Perintah build, test, dan dev ditambahkan di task Fase 0 berikutnya (T0.4 dst.).

## Lisensi

Semua hak dilindungi. Lihat [LICENSE](LICENSE).
