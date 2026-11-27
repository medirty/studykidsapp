# Desain: Auto-Posting Media Sosial (perluasan FR-14)

Status: **DRAFT, menunggu persetujuan Bimo**. Perlu CR-009 sebelum PRD berubah. Dibangun di Fase 5.

## 1. Maksud & alasan

FR-14 sudah menyiapkan konten marketing (kalender 30 hari, caption per platform, gambar PNG, pengingat jadwal) tetapi posting masih manual. Bimo ingin langkah terakhir otomatis: konten yang sudah jadi terbit sendiri ke platform yang dipilih, jadi tidak perlu unduh dan upload manual. Tujuan utama: konsistensi dan hemat waktu Bimo.

## 2. Tujuan / bukan tujuan / anti-tujuan

**Tujuan**
- Posting otomatis story, post, dan reel ke Instagram dan Facebook (prioritas utama), lalu TikTok.
- Admin memilih platform tujuan per item kalender.
- Menambah platform baru = menambah satu adapter, tanpa mengubah inti sistem.
- Hasil tiap posting (sukses/gagal + alasan) terlihat di dashboard admin.

**Bukan tujuan**
- Tidak mengubah generator konten FR-14 yang sudah ada.
- Tidak ada analytics sosial, balasan komentar, atau DM.
- Tidak ada platform di luar FB/IG/TikTok di rilis ini (hanya disiapkan jalurnya).
- Tidak ada layanan render video berbayar.

**Anti-tujuan (dianggap gagal walau jalan)**
- Konten berisi voucher/promo/kuota/testimoni terbit tanpa persetujuan.
- Konten memuat data pribadi anak.
- Token akun bocor (repo PUBLIC).
- Angka kuota basi terbit (mis. "tinggal 23 slot" padahal sudah habis).

## 3. Aturan persetujuan (keputusan Bimo: opsi C)

- **Otomatis terbit:** brand awareness, tips belajar, fakta sains, contoh soal seru.
- **Wajib disetujui Bimo dulu:** voucher, promo, angka kuota early bird, testimoni, dan apa pun yang memuat harga.
- Implementasi: tiap template konten punya tag `approval: auto | required`. Item bertag `required` berstatus `pending_approval` dan tidak akan dikirim sebelum disetujui di dashboard. (Dipilih builder: tag di template, bukan per-post, supaya tidak perlu menebak. Lihat §9.)

## 4. Pendekatan yang dipilih

Tiga opsi dipertimbangkan: (1) API langsung per platform, (2) layanan penjadwal pihak ketiga, (3) antarmuka adapter dengan API langsung sebagai awal. **Bimo memilih (3).**

- Instagram dan Facebook: API langsung (Meta Graph API), gratis, dikerjakan dulu.
- TikTok: adapter terpisah, dikerjakan setelah IG/FB. Bimo menerima bahwa audit TikTok bisa lama. Selama belum lolos audit, post TikTok otomatis private. Jika terlalu lama, adapter bisa diganti layanan pihak ketiga (keputusan terpisah, perlu ADR dan cek lisensi).

## 5. Rancangan

### 5.1 Komponen
- **Antarmuka adapter** `SocialPublisher` (PHP): `publish(PostJob): PublishResult`, `refreshToken()`, `supports(kind)`. Satu kelas per platform: `InstagramPublisher`, `FacebookPublisher`, `TikTokPublisher`.
- **Antrean** tabel `social_posts` (satu baris per item per platform): jenis (`story|post|reel`), platform, caption, path media, `scheduled_at` (UTC), status (`draft|pending_approval|scheduled|publishing|published|failed`), `attempts`, `error`, `external_id`.
- **Akun** tabel `social_accounts`: platform, nama akun, token terenkripsi, `token_expires_at`, status koneksi.
- **Cron** satu script (`bin/publish-due.php`) tiap beberapa menit: ambil baris `scheduled` yang jatuh tempo, kunci baris (cegah dobel posting), kirim lewat adapter, catat hasil. Gagal sementara diulang beberapa kali dengan jeda, lalu `failed`.
- **UI admin** (chunk lazy admin, terpisah dari bundle anak): hubungkan akun, pilih platform per item kalender, antrean persetujuan, status/log posting, tombol "posting ulang".

### 5.2 Media (masalah utama)
- Cron jalan saat browser admin tertutup, jadi media harus sudah jadi dan tersimpan di server sebelum jadwal. Meta mengambil media lewat URL publik.
- **Gambar:** dirender Canvas di browser admin (FR-14 yang ada), diunggah ke server saat item dijadwalkan. File tersimpan di folder media yang bisa diakses publik dengan nama acak.
- **Video (reel/TikTok):** slideshow pendek dirender di browser admin (Canvas + MediaRecorder), diunggah saat dijadwalkan. Hostinger shared tidak bisa ffmpeg. Format dan durasi tiap platform divalidasi sebelum menjadwalkan.
- Item hanya bisa berstatus `scheduled` jika media sudah terunggah.

### 5.3 Keamanan (wajib `security-review`)
- Token disimpan terenkripsi (kunci enkripsi dari env/GitHub Secrets, tidak pernah di repo). Tidak pernah muncul di log atau respons API.
- Semua endpoint admin: autentikasi admin, CSRF, rate limit, prepared statements.
- OAuth `state` diverifikasi saat menghubungkan akun.
- Angka kuota dan harga di konten dihitung ulang di server **tepat sebelum kirim**. Jika kuota sudah habis, item promo dibatalkan, bukan terbit basi.
- Konten dicek: tidak ada nama, foto, atau data anak.
- Skema memakai migrasi Phinx baru, `utf8mb4_unicode_ci`.

## 6. Kendala platform (verifikasi saat implementasi)
- Meta: perlu akun Instagram Business/Creator yang terhubung ke Page Facebook, app Meta, dan app review untuk izin posting. Token perlu diperpanjang berkala. Pengambilan media lewat URL publik.
- TikTok: Content Posting API perlu audit app. Sebelum lolos, hasil posting private. Tidak ada API story TikTok, jadi jenis `story` tidak tersedia untuk TikTok.
- Batas kuota harian per platform harus dihormati oleh antrean.

## 7. Dampak ke PRD (lewat CR-009, tunggu keputusan Bimo)
- §5.2: hapus baris "Posting otomatis ke media sosial via API".
- FR-14 poin 5 ("bukan auto-post") diubah; tambah FR baru untuk auto-posting.
- Tabel baru `social_posts`, `social_accounts` di §11/skema; tambah task di Fase 5.
- Keputusan ketergantungan baru (jika ada SDK) dicatat di `docs/DECISIONS.md`. Rencana: tanpa SDK, cukup HTTP client yang sudah ada.

## 8. Tindakan manual Bimo (B*)
Membuat akun Meta Business, menghubungkan IG ke Page, mendaftar app developer Meta dan TikTok. Akan dipandu langkah demi langkah sesuai CLAUDE.md butir 5.

## 9. Keputusan builder (cek ya)
- Tag persetujuan di template, bukan per post.
- Pembatalan otomatis item promo saat kuota habis.
- Retry terbatas, bukan tanpa batas.
- Tanpa SDK pihak ketiga.
- Dibangun di Fase 5, dipecah jadi task `[opus]` (skema, token, adapter, keamanan) dan `[sonnet]` (UI admin).

## 10. Belum diputuskan (untuk builder/plan)
- Jadwal cron tepatnya dan jumlah retry.
- Batas durasi/ukuran video final per platform.
- Detail enkripsi token (algoritma, rotasi kunci).
