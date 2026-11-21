# Panduan Vibe Coding StudyKids (Claude Desktop)

Panduan ini untuk Bimo: cara memulai, melanjutkan setiap hari, dan apa yang perlu ditulis ke Claude. Simpan file ini di `docs/` dan buka setiap kali bingung.

> **Prinsip utama:** kamu jadi *product owner*, Claude Code jadi programmer. Kamu memberi arah, mengecek hasil, dan menyetujui. Claude menulis kode sesuai `PRD.md`.

---

## 1. Gambaran alur kerja

```
Buka Claude Desktop → tab Code → folder studykidsapp
        │
        ▼
  Nyalakan MySQL (XAMPP)
        │
        ▼
  Prompt "mulai hari"  ──►  /next  ──►  Claude kerjakan 1 task
        ▲                                   │
        │                                   ▼
   Sesi baru  ◄──  setujui/cek hasil  ◄──  laporan + bukti test
        │
        ▼ (akhir fase)
  /gate → kamu cek → tulis "Fase X disetujui"
```

Aturan emas:

1. **Satu sesi = satu task.** Setelah satu task selesai, buka sesi baru. Ini menghemat kuota Claude Pro.
2. **Jangan lanjut fase** sebelum `/gate` bilang siap **dan** kamu sudah mengecek hasilnya sendiri.
3. **Jangan ganti model manual.** Pemilihan Opus/Sonnet sudah otomatis lewat folder `.claude/`.

---

## 2. Persiapan (sekali saja) — status per 21 Nov 2026

- [x] Node, npm, Git, Composer
- [x] PHP 8.4 di `C:\php-8.4` (8 ekstensi aktif)
- [x] XAMPP (MySQL)
- [x] Claude Code + GitHub CLI (login `medirty`)
- [x] Folder `studykidsapp` berisi `PRD.md`, `CLAUDE.md`, `.claude/`, `docs/`
- [ ] Beli domain `studykids.id` (dikerjakan di Fase 0, boleh kapan saja minggu ini)

---

## 3. Hari pertama: memulai project

### Langkah

1. Buka **XAMPP Control Panel** → klik **Start** pada **MySQL** (Apache tidak perlu).
2. Buka **Claude Desktop** → pilih tab **Code**.
3. Pilih / buka folder: `C:\Users\Lenovo\Documents\Work\studykidsapp`.
4. Mode izin: pilih yang **meminta izin** (Ask / default) dulu untuk minggu pertama, supaya kamu melihat apa yang dilakukan Claude. Setelah terbiasa, boleh pakai "accept edits".
5. Model: biarkan default. Folder `.claude/settings.json` sudah mengatur `opusplan` (Opus saat merencanakan, Sonnet saat mengerjakan).
6. Tempel prompt di bawah.

### Prompt pertama (copas persis)

```
Halo, ini hari pertama project StudyKids.
Baca CLAUDE.md, lalu PRD.md bagian §14 (roadmap), §16 (workflow), §17.1 (dev lokal), dan §17.5 (Git & GitHub).

Kita mulai Fase 0. Tolong:
1. Hubungkan folder ini ke repo github.com/medirty/studykidsapp (repo public), buat .gitignore dan LICENSE "All rights reserved", lalu commit & push pertama.
2. Buat docs/PROGRESS.md.
3. Jalankan /plan-phase untuk Fase 0.

Jangan mulai coding fitur apa pun. Setelah selesai, tunjukkan daftar task Fase 0 dan apa yang perlu aku lakukan sendiri (misalnya beli domain).
```

Setelah Claude menampilkan daftar task, baca sekilas. Kalau oke, balas:

```
Oke, rencana Fase 0 disetujui. Kerjakan /next.
```

---

## 4. Rutinitas harian (hari ke-2 dan seterusnya)

### A. Mulai hari

1. Start **MySQL** di XAMPP.
2. Claude Desktop → Code → folder `studykidsapp` → **sesi baru**.
3. Tempel:

```
Mulai hari. Baca CLAUDE.md dan docs/PROGRESS.md.
Ringkas dalam 5 baris: fase aktif, task terakhir yang selesai, task yang setengah jalan (kalau ada), dan task berikutnya.
Lalu jalankan /next.
```

### B. Setiap task selesai

Claude akan melapor: apa yang dikerjakan, bukti test, dan task berikutnya. Lalu:

1. **Cek hasilnya** (lihat bagian 6 "Cara mengecek hasil").
2. Kalau oke → buka **sesi baru** → ketik `/next`.
3. Kalau ada yang salah → tulis di sesi yang sama, misalnya:

```
Tombol "Coba Gratis" di HP terlalu kecil dan teksnya terpotong. Perbaiki sesuai PRD §9.1 dan §8.5 (target sentuh 48px).
```

> Kenapa sesi baru setiap task? Percakapan yang panjang menghabiskan kuota jauh lebih cepat. Semua ingatan project sudah tersimpan di `PROGRESS.md`, jadi Claude tidak "lupa".

### C. Akhir hari

Sebelum menutup laptop, di sesi yang sedang berjalan:

```
Tutup hari. Pastikan semua perubahan sudah di-commit dan di-push (lewat branch + PR sesuai aturan).
Update docs/PROGRESS.md: apa yang selesai hari ini, posisi terakhir kalau ada task setengah jalan, dan task berikutnya.
Beri aku ringkasan 3–5 baris dan daftar PR yang perlu aku merge.
```

Lalu buka GitHub, cek PR, dan **merge** jika CI hijau (centang hijau).

---

## 5. Akhir fase (phase gate)

Saat semua task dalam satu fase sudah dicentang:

```
/gate
```

Claude (Opus) akan menjalankan semua test dan mengecek Exit Criteria. Hasilnya:

- **"Belum siap"** → ketik `/next` untuk mengerjakan perbaikannya.
- **"Siap untuk persetujuan Bimo"** → cek sendiri hasilnya (bagian 6). Kalau puas, tulis:

```
Fase 0 disetujui. Buat tag phase-0-approved, lalu jalankan /plan-phase untuk Fase 1.
```

(Ganti angka fasenya.)

**Fase yang butuh perhatian khususmu:**

| Fase | Yang harus kamu cek |
|---|---|
| 1 Mockup & Brand | Lihat semua mockup di HP & laptop, setujui logo Kiko. Minta revisi sebanyak perlu, karena mengubah desain di fase ini jauh lebih murah. |
| 3 Demo | Coba demo di GitHub Pages bersama 3–5 anak. Catat apa yang membingungkan. |
| 4 Backend | Beli hosting Hostinger sebelum fase ini (PRD §17.2). |
| 6 Pembayaran | Daftar Midtrans dengan panduan `docs/PAYMENT_SETUP.md` yang dibuat Claude. |
| 7 Launch | Uji di 3 HP asli, baca kebijakan privasi. |

---

## 6. Cara mengecek hasil

| Mau cek apa | Caranya |
|---|---|
| App di laptop | Minta Claude: `Jalankan npm run dev dan beri aku link-nya.` Lalu buka `http://localhost:5173` di browser. |
| Tampilan HP | Di Chrome tekan `F12` → ikon HP (Toggle device) → pilih "Pixel 7" atau lebar 360px. |
| Di HP asli | Minta Claude: `Deploy demo ke GitHub Pages.` Lalu buka `https://medirty.github.io/studykidsapp/` di HP. |
| Mockup (Fase 1) | Minta: `Buka mockup di browser` atau buka file di `docs/mockups/`. |
| Test lolos atau tidak | Lihat laporan Claude (ada output test), atau centang hijau di PR GitHub. |
| Database | phpMyAdmin: nyalakan Apache di XAMPP sebentar → `http://localhost/phpmyadmin`. |

---

## 7. Situasi khusus & prompt-nya

### Ada bug

```
/fix Saat jawab soal terakhir, halaman ringkasan tidak muncul dan layar jadi putih. Terjadi di Chrome HP setelah sesi Math kelas 3.
```

Jelaskan: **apa yang terjadi**, **seharusnya bagaimana**, dan **langkah untuk memunculkannya**. Kalau Sonnet gagal 2×, Claude otomatis meneruskannya ke Opus.

### Punya ide fitur baru / mau ubah sesuatu di PRD

**Jangan** langsung bilang "tambahkan fitur X". Pakai:

```
/cr Aku mau ada fitur tantangan mingguan antar saudara dalam satu akun.
```

Claude akan menganalisis dampaknya dan merekomendasikan kapan dikerjakan. Kalau setuju, balas:

```
CR-001 disetujui, jadwalkan di Fase 5. Update PRD dan PROGRESS.md.
```

### Kuota Claude habis di tengah task

Claude biasanya sempat memberi tahu. Kalau sempat, tulis:

```
Kuota hampir habis. Simpan posisi sekarang di docs/PROGRESS.md (task apa, langkah ke berapa, apa yang belum), commit WIP ke branch, lalu berhenti.
```

Setelah kuota pulih (biasanya beberapa jam), pakai prompt "Mulai hari" seperti biasa. Claude akan membaca posisi terakhir.

### Claude bertanya sesuatu yang tidak kamu tahu

Jawab jujur:

```
Aku tidak paham istilah itu. Jelaskan dengan bahasa sederhana, beri 2 pilihan beserta untung-ruginya, dan rekomendasimu.
```

### Claude terlihat keluar jalur (mengerjakan hal di luar task / mengubah banyak file)

```
Stop. Kembali ke task yang ada di PROGRESS.md saja. Jangan kerjakan hal di luar task. Jelaskan apa saja yang sudah kamu ubah.
```

Kalau perlu membatalkan perubahan yang belum di-commit:

```
Batalkan semua perubahan yang belum di-commit di task ini, lalu mulai ulang task-nya dengan pendekatan yang lebih kecil.
```

### Hasil kerja tidak sesuai bayanganmu (desain/UX)

Beri contoh konkret, jangan hanya "kurang bagus":

```
Halaman beranda anak terasa terlalu ramai. Aku mau: maksimal 4 kartu mapel terlihat tanpa scroll, Kiko di pojok kiri atas menyapa dengan nama anak, tombol "Lanjut belajar" besar di bawah. Revisi mockup-nya dulu sebelum coding.
```

### Mau melihat progress keseluruhan

```
Tampilkan ringkasan progress project: fase mana yang sudah selesai, fase aktif, persentase task fase aktif, dan perkiraan task tersisa sampai demo (Fase 3) dan launch (Fase 7).
```

---

## 8. Kumpulan prompt cepat (cheat sheet)

| Situasi | Ketik |
|---|---|
| Mulai hari | `Mulai hari. Baca CLAUDE.md dan docs/PROGRESS.md, ringkas posisi, lalu /next.` |
| Task berikutnya | `/next` |
| Rencanakan fase | `/plan-phase` |
| Ada bug | `/fix <apa yang terjadi, seharusnya apa, cara memunculkan>` |
| Ide / perubahan | `/cr <idenya>` |
| Akhir fase | `/gate` |
| Setujui fase | `Fase N disetujui. Buat tag phase-N-approved, lalu /plan-phase untuk Fase N+1.` |
| Lihat app | `Jalankan npm run dev dan beri aku link-nya.` |
| Demo ke HP | `Deploy demo ke GitHub Pages dan beri link-nya.` |
| Tutup hari | `Tutup hari. Commit & push, update PROGRESS.md, ringkas, daftar PR untuk di-merge.` |
| Kuota menipis | `Simpan posisi di PROGRESS.md, commit WIP, lalu berhenti.` |

---

## 9. Boleh & jangan

**Boleh / sebaiknya:**

- Buka sesi baru untuk setiap task.
- Cek hasil di tampilan HP setiap selesai task UI.
- Minta penjelasan dengan bahasa sederhana kapan saja.
- Merge PR hanya jika centang CI hijau.
- Kerjakan `/plan-phase` dan `/gate` (pakai Opus, lebih boros) di awal hari saat kuota masih penuh.

**Jangan:**

- Menulis "kerjakan semua fase sekaligus" atau "buat seluruh app". Ini cepat menghabiskan kuota dan hasilnya berantakan.
- Mengganti model manual ke Opus untuk semua hal.
- Menambah fitur langsung tanpa `/cr`.
- Menyetujui fase tanpa mengecek sendiri.
- Menaruh password, API key, atau data asli di chat atau di file project (repo-nya public).
- Mengedit `PRD.md` sendiri diam-diam. Lewat `/cr` supaya tercatat dan Claude tahu.

---

## 10. Troubleshooting cepat

| Masalah | Solusi |
|---|---|
| Claude bilang tidak bisa konek database | Pastikan MySQL di XAMPP sudah **Start** (hijau). |
| `/next` atau command lain tidak dikenal | Pastikan folder yang dibuka di Claude Desktop adalah `studykidsapp` dan ada folder `.claude/commands/` di dalamnya. Buka sesi baru. |
| Port 5173/8000 dipakai | `Ada port yang bentrok, cari prosesnya dan matikan, lalu jalankan npm run dev lagi.` |
| CI merah di PR | `CI di PR #<nomor> merah. Cek log-nya dan perbaiki.` |
| GitHub Pages blank putih | `GitHub Pages blank. Cek VITE_BASE=/studykidsapp/ sesuai PRD §17.5.` |
| Claude lupa aturan / mulai melenceng | Buka sesi baru, mulai dengan prompt "Mulai hari". |
| Bingung harus apa | `Aku bingung harus ngapain selanjutnya. Lihat PROGRESS.md dan beri tahu 1 langkah berikutnya untukku.` |
