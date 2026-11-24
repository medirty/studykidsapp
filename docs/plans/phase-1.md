# Rencana Fase 1 — Mockup & Brand

Sumber: PRD §14 (baris Fase 1), §9.1–9.4, §8.5, §6.1, FR-1, FR-2, FR-4–FR-7, FR-9, FR-10, FR-12–FR-14.
Dibuat: 24 Nov 2026 lewat `/plan-phase`. Checklist ringkas ada di `docs/PROGRESS.md`.

## Exit Criteria (PRD §14)

| # | Kriteria | Dibuktikan oleh task |
|---|---|---|
| E1 | Logo final disetujui Bimo secara tertulis (AC §9.4: dikenali di 32×32, satu warna) | T1.2, T1.3 → B10 |
| E2 | Design tokens final (`tokens.css`) dengan kontras AA terbukti | T1.1 |
| E3 | Mockup HTML statis **semua 11 layar §9.3**, mobile (360 px) & desktop, di `docs/mockups/` | T1.4–T1.14 |
| E4 | Bimo menyetujui mockup secara tertulis | T1.15 → B11 → `/gate` |

## Aturan umum Fase 1

- Mockup = **HTML + CSS statis** (tanpa Svelte, tanpa build). JS hanya untuk toggle kecil (mis. ganti bahasa/tab) bila perlu.
- Semua warna lewat token (`docs/mockups/assets/mockup.css` meng-`@import` `frontend/src/styles/tokens.css`, bukan salinan).
- Teks contoh **ID** utama + toggle EN di setiap mockup (membuktikan layout tahan teks EN yang lebih panjang). Belum lewat sistem i18n (itu Fase 2).
- Tiap layar: lebar 360 px tanpa scroll horizontal, target sentuh ≥ 48 px, fokus terlihat, ✓/✗ + warna (§8.5), aksi utama di bawah (§9.1).
- Kelas 1–2 vs 5–6 (§9.1 no. 2): beranda & layar soal punya **dua varian** (kecil: ikon besar, minim teks; besar: lebih "dewasa").
- Data contoh fiktif, tanpa data anak asli. Tanpa logo/teks/soal Cambridge (§6.1). Aset baru dicatat di `docs/ASSET_LICENSES.md`.
- Skill: `impeccable` (shape, critique, polish) untuk arah visual; `design:accessibility-review` di T1.15.
- **Kategori wajib review (§17.5):** PR mockup/logo **tidak** di-auto-merge — tunggu persetujuan Bimo. Agar Bimo tidak menunggu per layar, PR boleh di-merge setelah CI hijau dengan label "draft visual"; persetujuan formal dikumpulkan di B10 (logo) dan B11 (semua mockup). *(Disetujui Bimo 24 Nov 2026.)*
- Mockup dilihat lewat GitHub Pages `/studykidsapp/mockups/` (HP & laptop); avatar cukup 4 contoh di fase ini (Bimo, 24 Nov 2026).

## Task (urut dependensi)

Setiap task = 1 sesi `/next`, 1 branch (`feat/f1-...` / `docs/f1-...`), 1 PR.

### T1.0 `[sonnet]` Bersih-bersih sisa gate Fase 0
- **PRD:** §17.3, §17.5; temuan gate L-1 & M-1 (`docs/plans/gate-phase-0.md`).
- **Isi:** L-1: Dependabot #19 (rebase via `@dependabot rebase`) & #20 (TypeScript 7 → tutup, alasan D-005). M-1: pecah job deploy Pages (build/deploy terpisah). Tambahan (keputusan Bimo 24 Nov 2026): artefak Pages menyertakan `docs/mockups/` di `/studykidsapp/mockups/` (folder dibuat kosong + `index.html` placeholder). Izin ubah workflow deploy sudah diberikan Bimo.
- **AC:** tidak ada PR Dependabot terbuka tanpa keputusan; `https://medirty.github.io/studykidsapp/` tetap 200 dan `/mockups/` 200 setelah perubahan.

### T1.1 `[sonnet]` Design tokens final + font self-host
- **PRD:** §9.2, §8.5, §8.1.
- **Isi:** lengkapi `tokens.css`: skala tipografi (kelas kecil/besar), shadow, durasi/easing animasi + `prefers-reduced-motion`, focus ring, warna turunan yang dibutuhkan (mis. ink lembut, garis) — tetap di satu file. Self-host **Baloo 2** & **Nunito** (OFL, subset latin, `woff2`, `font-display: swap`) di `frontend/public/fonts/`; catat lisensi di `ASSET_LICENSES.md`. Tabel kontras pasangan warna (teks/latar) di `docs/brand/tokens.md`.
- **AC:** unit test (Vitest) menghitung kontras setiap pasangan teks yang dipakai ≥ 4.5:1 (teks besar ≥ 3:1); `npm run check` hijau, ukuran font total dicatat (CSS/JS awal tetap dalam budget).

### T1.2 `[sonnet]` Logo final Kiko
- **PRD:** §9.4. Acuan: `docs/brand/logo-concept-v2.svg`.
- **Isi:** `docs/brand/`: ikon Kiko saja, logo horizontal, versi satu warna (Ink) & putih; **wordmark jadi path** (tanpa font). Turunan: `favicon.svg` + `favicon-32.png`, PWA 192/512, maskable 512 (safe zone) — PNG dirender dengan Playwright (sudah terpasang, tanpa dependency baru). Halaman `docs/brand/index.html` menampilkan semua varian di latar terang/gelap + ukuran 32/48/192.
- **AC:** ikon dikenali di 32×32 (screenshot di PR); tanpa ikon terlarang §9.4; SVG valid & ringan (ikon ≤ 4 KB); lisensi dicatat (karya orisinal).

### T1.3 `[sonnet]` Ekspresi Kiko + avatar contoh
- **PRD:** §9.4 (4 ekspresi), FR-2 (avatar), FR-7.
- **Isi:** SVG Kiko: senang, semangat, kaget, tidur — gaya konsisten dengan T1.2. 4 avatar orisinal contoh untuk mockup pilih profil (12 lengkap menyusul di Fase 2 bila disetujui).
- **AC:** ditampilkan di `docs/brand/index.html`; tiap SVG ≤ 6 KB; ekspresi "semangat" tidak terkesan sedih/menghukum (§9.1 no. 4).
- **→ B10:** Bimo menyetujui logo & Kiko tertulis sebelum layar dibuat penuh.

### T1.4 `[sonnet]` Kerangka mockup + pengecekan otomatis
- **PRD:** §9.3, §8.5, §15.1.
- **Isi:** `docs/mockups/index.html` (galeri 11 layar, tautan mobile/desktop), `assets/mockup.css` (import token + font + komponen dasar: tombol, kartu, header dengan toggle ID/EN, bottom bar), pola halaman contoh. Playwright spec memuat semua `docs/mockups/*.html` di 360 px & 1280 px: tanpa scroll horizontal + axe 0 pelanggaran serius/kritis; dijalankan di `npm run test:e2e`.
- **AC:** spec lolos lokal & CI; menambah layar baru tidak perlu mengubah spec (glob otomatis).

### T1.5 `[sonnet]` Layar 1 — Landing page (mobile & desktop)
- **PRD:** FR-1, §4.2, §9.3 no. 1.
- **Isi:** hero Kiko, keunggulan, daftar 8 mapel (warna mapel), contoh soal yang bisa dicoba (statis/tap sederhana), harga early bird + penghitung slot (angka contoh, ditandai "dari server"), FAQ, CTA "Coba Gratis".
- **AC:** jalur "Coba Gratis" → pilih kelas ≤ 2 klik (tautan antar mockup); harga tidak tampil sebagai fakta final di luar §4.2.

### T1.6 `[sonnet]` Layar 2–3 — Pilih kelas/profil + Beranda anak
- **PRD:** FR-2, FR-3, FR-7, §9.3 no. 2–3, §9.1.
- **Isi:** pilih kelas 1–6 (demo) & pilih profil (avatar, PIN opsional); beranda: mapel (demo terbuka, sisanya gembok), streak (bahasa positif), XP/level, "Lanjutkan belajar". Varian kelas 1–2 & 5–6.
- **AC:** buka → mulai belajar ≤ 3 tap (FR-2) ditunjukkan dengan tautan; tidak ada pesan negatif soal streak (FR-7).

### T1.7 `[sonnet]` Layar 4 — Peta belajar mapel
- **PRD:** FR-4, §5.1 (demo unit 1–2), §9.3 no. 4.
- **Isi:** unit sebagai "pulau", skill sebagai titik; status terkunci/tersedia/bintang 1–3; unit 3+ terkunci dengan gembok + CTA "Buka semua materi".
- **AC:** status dibedakan bukan hanya warna (ikon/teks); jalur bisa di-scroll di 360 px.

### T1.8 `[sonnet]` Layar 5a — Soal: `mcq`, `input`, `tf`, `tap`, `listen`
- **PRD:** FR-5 (tabel format), FR-8, §9.3 no. 5.
- **Isi:** satu mockup per format; progres sesi (soal x/10), tombol 🔊, keyboard angka khusus untuk `input`, tombol "Periksa" di bawah. Varian kelas kecil/besar minimal untuk `mcq`.
- **AC:** pilihan jawaban ≥ 48 px; soal contoh orisinal.

### T1.9 `[sonnet]` Layar 5b — Soal: `dragdrop`, `match`, `order`, `draw`
- **PRD:** FR-5, §9.3 no. 5.
- **Isi:** keadaan awal + keadaan "sedang diseret/dipilih" (statis); `draw` dengan palet warna mapel Art & tombol "Selesai" (tanpa nilai benar/salah).
- **AC:** ada alternatif tap-untuk-pilih selain seret (aksesibilitas, dicatat sebagai catatan desain untuk Fase 2/3).

### T1.10 `[sonnet]` Layar 6–7 — Feedback benar/salah + Ringkasan sesi
- **PRD:** FR-5 (Feedback), FR-7, FR-9, §9.3 no. 6–7.
- **Isi:** benar: Kiko senang + XP; salah: Kiko semangat + jawaban benar + penjelasan + tombol "dengarkan"; ringkasan: bintang, XP, skill naik/turun, "Main lagi"/"Kembali ke peta".
- **AC:** tanpa kata "salah besar/gagal"; ✓/✗ + warna + ikon; animasi punya alternatif `prefers-reduced-motion` (dicatat).

### T1.11 `[sonnet]` Layar 8 — Mini game contoh "Balon Angka"
- **PRD:** FR-6, §9.3 no. 8.
- **Isi:** layar main (soal, balon jawaban, timer 60–120 dtk, skor, tombol pause) + layar pause + layar hasil.
- **AC:** tombol pause selalu terlihat; target balon ≥ 48 px di 360 px.

### T1.12 `[sonnet]` Layar 9 — Laporan anak & laporan ortu
- **PRD:** FR-9, §9.3 no. 9.
- **Isi:** anak: "Kamu jago di…" (3 teratas) + "Ayo latih…" (3 terendah + "Latih sekarang"); ortu: grafik mingguan (gambar statis/SVG, uPlot baru di Fase 2+), waktu belajar, mapel terkuat/terlemah, riwayat 30 hari; keadaan "Data belum cukup" (< 10 soal).
- **AC:** ketiga keadaan ada (cukup data, belum cukup, demo vs full); bahasa positif di laporan anak.

### T1.13 `[sonnet]` Layar 10 — Parent Gate, paywall/kode aktivasi, kritik & saran
- **PRD:** FR-2 (Parent Gate), FR-10, FR-12, §4.2, §9.3 no. 10.
- **Isi:** Parent Gate (soal hitungan dewasa / password ortu); paywall (manfaat Full, harga early bird + sisa slot, tombol "Beli" bertanda *Fase 6*, input kode `SK-XXXX-XXXX`); form kritik & saran (bintang 1–5, kategori, teks) + keadaan terkirim.
- **AC:** keypad Parent Gate tidak mudah ditebak anak (soal perkalian 2 digit); harga dari "settings" (ditulis sebagai contoh).

### T1.14 `[sonnet]` Layar 11 — Admin: dashboard, penjualan, marketing tools
- **PRD:** FR-13, FR-14, §9.3 no. 11.
- **Isi:** desktop-first (tetap terbaca di 360 px): dashboard (kartu angka + grafik 30 hari), penjualan (tabel order + filter + export CSV), marketing tools (kalender konten, preview gambar post 1080×1080, UTM builder, voucher). Login admin + 2FA cukup satu layar sederhana.
- **AC:** gaya admin terpisah dari gaya anak (lebih padat/netral, tetap pakai token); angka contoh konsisten antar layar.

### T1.15 `[sonnet]` Review aksesibilitas & konsistensi + paket persetujuan
- **PRD:** §8.5, §9.1, §9.3.
- **Isi:** jalankan `design:accessibility-review` & `design:design-critique` ke semua mockup; perbaiki temuan; checklist 11 layar × (mobile, desktop) di `docs/mockups/README.md`; ringkas keputusan desain yang dibawa ke Fase 2 (komponen yang perlu dibuat).
- **AC:** spec T1.4 hijau untuk semua file; checklist 100%; Bimo bisa membuka semua layar dari satu halaman galeri.
- **→ B11:** Bimo menyetujui mockup & logo tertulis.

### Gate `[opus]` — `/gate` oleh subagent `reviewer`, lalu Bimo menulis "Fase 1 disetujui" → tag `phase-1-approved`.

## Tindakan manual Bimo

| # | Tindakan | Kapan | Rujukan |
|---|---|---|---|
| B1 | Beli domain `studykids.id` (masih terbuka dari Fase 0) | Secepatnya | §14 |
| B10 | Setujui logo final + 4 ekspresi Kiko (tulis "Logo disetujui" atau minta revisi) | Setelah T1.3 | §9.4, §20 no. 3 |
| B11 | Review semua mockup di galeri, tulis persetujuan/revisi | Setelah T1.15 | §14 |

## Di luar scope Fase 1 (jangan dikerjakan)

Komponen Svelte, i18n nyata, routing, PWA manifest di app (Fase 2); 12 avatar lengkap & item kosmetik (Fase 2/5); konten soal nyata (Fase 3); grafik uPlot interaktif.
