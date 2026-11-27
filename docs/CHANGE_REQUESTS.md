# CHANGE REQUESTS

Permintaan perubahan PRD atau fitur baru. Proses lengkap: PRD §18. Fitur baru tidak boleh menyela fase aktif kecuali bug kritis.

Alur: catat → analisis dampak (Opus) → keputusan Bimo → naikkan versi PRD → tambah task di `PROGRESS.md` → kerjakan dengan DoD → jalankan seluruh test suite.

## Template

```
## CR-NNN — Judul
- **Tanggal / Pengaju:**
- **Deskripsi:**
- **Alasan:**
- **Prioritas:** wajib | bagus-jika-ada
- **Analisis dampak:** fitur/file/tabel terpengaruh, perkiraan jumlah task, risiko, mengganggu fase aktif atau tidak
- **Keputusan Bimo:** diterima sekarang | dijadwalkan di fase X | ditolak
- **Status:**
```

## Daftar

| ID | Judul | Status | PRD |
|---|---|---|---|
| CR-001 | Aturan subagent & auto-merge PR | Diterapkan (21 Nov 2026) | v1.7 |
| CR-002 | Bantuan langsung saat task terblokir tindakan manual | Diterapkan (22 Nov 2026) | v1.8 |
| CR-003 | Skill tambahan: ponytail, security-review, graphify (ditunda) | Diterapkan dokumen (23 Nov 2026); instalasi menunggu verifikasi | v1.9 |
| CR-005 | Ganti skill frontend-design dengan impeccable | Diterapkan (24 Nov 2026) | v1.11 |
| CR-006 | Model bisnis: sekali bayar → langganan | Diterapkan dokumen (25 Nov 2026); kode di Fase 4–6 | v1.12 |
| CR-007 | Warna English #8B5CF6 → #7C3AED | Diterapkan (25 Nov 2026) | v1.13 |
| CR-008 | Arah visual "ceria penuh warna" untuk anak SD | Diterima, semua pertanyaan terjawab (26 Nov 2026); kode di awal Fase 3 | v1.14 |
| CR-009 | Auto-posting media sosial (FB/IG/TikTok) | Diusulkan, desain disetujui (27 Nov 2026); menunggu keputusan CR | — |

## CR-001 — Aturan subagent & auto-merge PR
- **Tanggal / Pengaju:** 21 Nov 2026 / Bimo
- **Deskripsi:** Subagent hanya 4 milik project (`architect`, `reviewer`, `implementer`, `tester`), maksimal 1 berjalan bersamaan. Rencana dieksekusi di sesi utama, tanpa worktree. PR di-merge otomatis jika syarat objektif terpenuhi; Bimo hanya ditanya untuk kategori berisiko.
- **Alasan:** Skill plugin superpowers bisa membuat subagent paralel dan worktree sendiri sehingga kuota Pro cepat habis dan routing model tidak terkontrol. Merge juga terlalu sering ditanyakan.
- **Prioritas:** wajib
- **Keputusan Bimo:** diterima sekarang (21 Nov 2026)
- **Status:** diterapkan di PRD v1.7 (§16.2, §17.5), `CLAUDE.md`, `docs/PANDUAN_VIBE_CODING.md`. Arsip rinci: [plans/CR-001-subagent-dan-auto-merge.md](plans/CR-001-subagent-dan-auto-merge.md).

## CR-002 — Bantuan langsung saat task terblokir tindakan manual
- **Tanggal / Pengaju:** 22 Nov 2026 / Bimo
- **Deskripsi:** Jika task berikutnya terblokir tindakan manual (item `B*` di `PROGRESS.md`, mis. B9 upgrade Node), Claude tidak berhenti di "Bimo harus melakukan X". Urutannya:
  1. Jelaskan dengan bahasa sederhana untuk non-programmer: apa yang kurang dan kenapa dibutuhkan.
  2. Coba jalankan sendiri (instalasi/upgrade/konfigurasi), dengan izin Bimo per instalasi seperti BOOTSTRAP.
  3. Sebelum memberi perintah ke Bimo, cek dulu kondisi nyata di laptop (mis. `winget list`, lokasi program) supaya perintahnya pasti cocok. Contoh kasus: Node terdaftar sebagai `OpenJS.NodeJS.22`, bukan `OpenJS.NodeJS.LTS`, sehingga `winget upgrade` gagal.
  4. Jika ditolak sistem izin Claude Code atau butuh hak admin/UAC: jangan mengakali izin. Beri langkah klik-demi-klik bernomor (apa yang dibuka, apa yang diketik/disalin, tampilan yang diharapkan), satu perintah per langkah.
  5. Setelah Bimo selesai: verifikasi sendiri (mis. `node --version`, `node scripts/doctor.mjs`), centang item `B*` di `PROGRESS.md`, lalu lanjut ke task.
- **Alasan:** Bimo tidak berlatar teknis. Pada `/next` 22 Nov 2026, T0.5 berhenti karena B9 tanpa bantuan yang bisa diikuti.
- **Prioritas:** wajib
- **Analisis dampak:**
  - **File:** PRD §16.5 (protokol sesi: langkah "jika terblokir tindakan manual"), riwayat versi → v1.8; `CLAUDE.md` (bagian "Mulai setiap sesi"); `.claude/commands/next.md`; `docs/PANDUAN_VIBE_CODING.md` (jika membahas tindakan manual).
  - **FR/tabel/kode aplikasi:** tidak ada. Hanya aturan kerja.
  - **Jumlah task:** 1 task docs `[sonnet]`.
  - **Risiko:** (a) Claude memasang software tanpa persetujuan → mitigasi: tetap minta izin per instalasi, tidak pernah mengakali penolakan izin. (b) Perubahan `.claude/` & `CLAUDE.md` masuk kategori wajib review → PR tidak di-merge otomatis, harus disetujui Bimo.
  - **Fase aktif:** tidak mengganggu. Justru membuka blokir T0.5 (B9).
- **Rekomendasi:** diterima sekarang. Kecil, tanpa kode aplikasi, langsung berguna untuk B9 dan tindakan manual berikutnya (B3, B8, B1).
- **Keputusan Bimo:** diterima sekarang (22 Nov 2026)
- **Status:** diterapkan di PRD v1.8 (§16.5), `CLAUDE.md`, `.claude/commands/next.md`.

## CR-003 — Skill tambahan: ponytail, security-review (selektif), graphify (ditunda)
- **Tanggal / Pengaju:** 23 Nov 2026 / Bimo
- **Deskripsi:** Pasang plugin **ponytail** (kode minimal) dan skill **security-review** dari ECC (hanya folder skill itu). **graphify** dijadwalkan evaluasi di awal Fase 4 (mode code-only lokal). ECC paket penuh tidak dipakai. Tambah tabel "kapan memakai skill apa" + batas ponytail (PRD §16.4.1–16.4.2) dan field `skills:` di subagent.
- **Alasan:** Hemat token/kuota Pro dan kode lebih ringkas (budget bundle 120 KB); security-review berguna untuk auth (Fase 4) dan pembayaran (Fase 6). ECC penuh bertabrakan dengan CR-001 (4 subagent), keputusan tanpa plugin memori, dan duplikat superpowers.
- **Prioritas:** disarankan
- **Analisis dampak:** PRD §16.4 (+§16.4.1, §16.4.2), riwayat → v1.9; `CLAUDE.md`; `.claude/agents/*.md`; `docs/setup/BOOTSTRAP.md`; `scripts/doctor.mjs`; `docs/PANDUAN_VIBE_CODING.md`. Tanpa kode aplikasi. Risiko: skill pihak ketiga menjalankan perintah tak terduga → mitigasi: baca SKILL.md & script sebelum pasang, izin Bimo per instalasi.
- **Keputusan Bimo:** diterima sekarang (23 Nov 2026)
- **Status:** diterapkan di PRD v1.9. Arsip rinci: [plans/CR-003-skills-ponytail-graphify-ecc.md](plans/CR-003-skills-ponytail-graphify-ecc.md).

## CR-004 — Database lokal: XAMPP (MariaDB 10.4) → MariaDB 11.8 standalone
- **Tanggal / Pengaju:** 23 Nov 2026 / Bimo
- **Deskripsi:** Ganti database lokal ke MariaDB 11.8 (service Windows), CI ke `mariadb:11.8`, koneksi DB mengatur sql_mode/UTC/collation sendiri, `scripts/db-setup.ps1`, HeidiSQL pengganti phpMyAdmin.
- **Alasan:** Laptop (10.4), CI (MySQL 8.0), dan Hostinger (11.8) memakai tiga database berbeda; XAMPP 10.4 sudah tidak didukung.
- **Prioritas:** wajib
- **Analisis dampak:** PRD K9, §10.1, §17.1, §17.2, riwayat → v1.10; `CLAUDE.md`; `ci.yml`; `Database.php`; `doctor.mjs`; `SETUP_LOCAL.md`; BOOTSTRAP; PANDUAN. Skema DB tidak berubah. Alur deploy tidak berubah.
- **Keputusan Bimo:** diterima (23 Nov 2026), syarat: deploy tidak boleh lebih susah.
- **Status:** diterapkan di PRD v1.10. Arsip rinci: [plans/CR-004-mariadb-tanpa-xampp.md](plans/CR-004-mariadb-tanpa-xampp.md).

## CR-005 — Ganti skill frontend-design dengan impeccable
- **Tanggal / Pengaju:** 24 Nov 2026 / Bimo
- **Deskripsi:** Plugin `frontend-design` dilepas; skill **impeccable** (`github.com/pbakaus/impeccable`, Apache-2.0) dipasang di `.claude/skills/impeccable/` sebagai skill desain UI (perintah `critique`, `audit`, `polish`, dst. + detektor "AI slop").
- **Alasan:** Fase 1 (Mockup & Brand) menuntut kualitas desain; impeccable punya perintah review terukur dan detektor aturan deterministik.
- **Prioritas:** disarankan
- **Analisis dampak:** PRD §16.4, §16.4.1, riwayat → v1.11; `CLAUDE.md`; `docs/setup/BOOTSTRAP.md`; `scripts/doctor.mjs` + `doctor-utils.mjs`; `docs/PANDUAN_VIBE_CODING.md`; `docs/SETUP_LOCAL.md`; `docs/plans/phase-1.md`; `.claude/settings.json`. Tanpa kode aplikasi. Risiko dan mitigasi: lihat D-010.
- **Keputusan Bimo:** diterima (24 Nov 2026)
- **Status:** diterapkan di PRD v1.11. Instalasi: D-010.

## CR-006 — Model bisnis: dari sekali bayar menjadi langganan
- **Tanggal / Pengaju:** 25 Nov 2026 / Bimo
- **Deskripsi:** Demo gratis tetap. Akses Full berubah dari **sekali bayar seumur hidup** menjadi **berlangganan**. Kuota tetap: 100 pelanggan pertama Rp50.000, setelah itu Rp100.000. Harga dan kuota bisa diubah kapan saja (lewat tabel `settings`/admin).
- **Alasan:** Pendapatan berulang untuk menutup biaya hosting & produksi konten berkelanjutan (konten baru 2 minggu sekali, PRD §15).
- **Prioritas:** wajib (harus diputuskan sebelum skema DB Fase 4 dan pembayaran Fase 6)
- **Analisis dampak:**
  - **PRD:** §1 (model bisnis), §4.1 (keputusan baru), §4.2 (harga + kebijakan "seumur hidup/tanpa refund" ditulis ulang), §5.1 (kolom "Full (sekali bayar)"), §5.2 (hapus "Langganan bulanan" dari Out of Scope), FR-10, FR-11, FR-13 (template urgensi), FR-14 (admin: pendapatan berulang), §12 (tabel `entitlements`, `orders`, `settings`), §13 (API), Fase 4 & 6 + Exit Criteria, risiko, riwayat → v1.12.
  - **Skema DB (migrasi Phinx baru, belum ada):** `entitlements` + `expires_at`; tabel `subscriptions` (status `active/past_due/canceled/expired`, `period`, `current_period_end`, `locked_price`, `is_early_bird`); `orders` + `type` (`initial/renewal`) & `period`; `settings` + `subscription_period_days`/jatuh tempo/masa tenggang.
  - **Kode (belum ada, baru dibuat di Fase 4–6):** `EntitlementService` (cek masa aktif), `SubscriptionService`, cron perpanjangan + pengingat email, endpoint `/subscription` (status, batal), kuota early bird, token konten Full dengan masa berlaku.
  - **Mockup Fase 1:** `landing.html` (T1.5, selesai: teks harga "Rp50.000" harus jadi "Rp50.000/periode"); T1.13 (paywall & kode aktivasi → pilih paket, status langganan, batal) dan T1.14 (admin: pelanggan aktif, MRR, churn) belum dikerjakan, cukup diubah isi task-nya. `phase-1.md` ikut diperbarui.
  - **Jumlah task:** ± 1 docs (PRD+riwayat) + 2 mockup (edit landing, ubah T1.13/T1.14) + Fase 4: 2 (skema, EntitlementService) + Fase 6: 4–5 (SubscriptionService, perpanjangan/cron, pengingat email, batal, tes konkurensi & webhook perpanjangan) + admin 1 → ±10 task, mayoritas `[opus]` (skema, pembayaran, entitlement).
  - **Risiko:**
    1. Pembayaran berulang otomatis di Indonesia terbatas: QRIS/VA/e-wallet umumnya bukan auto-debit (Midtrans: hanya kartu/GoPay tertentu). Pilihan realistis = **perpanjangan manual** dengan pengingat email, bukan auto-debit.
    2. Churn: pelanggan lapsed harus tetap punya data (progres anak jangan dihapus), hanya konten Full terkunci.
    3. Hukum perlindungan konsumen untuk perpanjangan otomatis & aplikasi anak → konsultasi ahli (PRD §4.2).
    4. Perubahan harga "kapan saja" tanpa aturan jelas bisa membingungkan pelanggan lama.
    5. Kuota early bird: definisi "100 pertama" harus tegas (lihat pertanyaan).
    6. Kategori wajib tanya Bimo: menyentuh harga/pembayaran/auth → `security-review` di Fase 6.
  - **Fase aktif (1):** hampir tidak mengganggu. Hanya teks mockup yang diubah; tidak ada kode/skema yang sudah jadi.
- **Pertanyaan untuk Bimo (jawaban menentukan isi PRD v1.12):**
  1. **Periode langganan:** bulanan, tahunan, atau keduanya? Rp50.000/Rp100.000 itu per periode apa?
  2. **Harga pelanggan awal:** apakah 100 pelanggan pertama **terkunci Rp50.000 selama tetap berlangganan** (rekomendasi, adil & jadi daya tarik), atau hanya periode pertama lalu ikut harga normal?
  3. **Perubahan harga kapan saja:** berlaku untuk pelanggan **baru** saja (rekomendasi); pelanggan lama tetap di harga saat mendaftar (`locked_price`).
  4. **Perpanjangan:** manual + pengingat email (rekomendasi, sesuai gateway QRIS/VA) atau auto-debit kartu?
  5. **Lewat masa aktif:** masa tenggang (mis. 3 hari), lalu konten Full terkunci, progres tetap tersimpan; jika berlangganan lagi, progres lanjut. Setuju?
  6. **Pelanggan early bird yang berhenti lalu kembali:** tetap Rp50.000 atau ikut harga normal? (rekomendasi: ikut harga normal)
  7. **Refund & kode aktivasi:** kode aktivasi memberi masa berapa lama (mis. 1 periode)? Kebijakan refund per periode?
- **Rekomendasi:** **diterima sekarang**, dijadwalkan dikerjakan: dokumen/mockup di Fase 1 (murah, tanpa kode), skema di Fase 4, logika langganan di Fase 6. Alasan: belum ada skema/kode pembayaran yang harus dibongkar; menunda sampai Fase 4+ akan membuat migrasi `entitlements` dan mockup harus diulang. Syarat: Bimo menjawab 7 pertanyaan di atas dulu. Saran isi tersingkat: bulanan + tahunan (diskon ±2 bulan), early bird terkunci selama aktif, perpanjangan manual dengan pengingat.
- **Keputusan Bimo:** diterima sekarang (25 Nov 2026). Jawaban: bulanan + tahunan (tahunan = 10× bulanan, early bird Rp50.000/bln & Rp500.000/thn, normal Rp100.000/bln & Rp1.000.000/thn); early bird terkunci selama langganan tidak terputus; perpanjangan manual; sisanya sesuai rekomendasi (harga baru hanya untuk order pertama berikutnya, masa tenggang 3 hari lalu terkunci dengan progres aman, early bird yang kembali → harga normal, kode aktivasi 1 periode, tanpa refund kecuali kegagalan teknis).
- **Status:** diterapkan di PRD v1.12, `phase-1.md`, `PROGRESS.md`, `landing.html`. Kode/skema menyusul di Fase 4 & 6.

## CR-007 — Warna English #8B5CF6 → #7C3AED
- **Alasan:** `#8B5CF6` hanya 4,23:1 dengan putih (gagal AA teks biasa). `#7C3AED` = 5,70:1.
- **Dampak:** PRD §9.2, `tokens.css`, `docs/brand/tokens.md`, test kontras (pengecualian English dihapus). Tidak ada skema/kode lain.
- **Keputusan Bimo:** disetujui 25 Nov 2026 ("ya #7C3AED").
- **Status:** diterapkan di PRD v1.13.

## CR-008 — Arah visual "ceria penuh warna" untuk anak SD
- **Tanggal / Pengaju:** 26 Nov 2026 / Bimo ("front end masih kurang menarik buat anak kecil")
- **Deskripsi:** Ubah bahasa visual app dari "kartu putih di latar krem + garis warna tipis" menjadi **ceria penuh warna**: (1) ubin mapel berwarna penuh dengan ilustrasi/ikon besar per mapel, bukan garis 12 px di kiri; (2) warna `sunny`/`teal`/`bubblegum` dipakai sebagai latar bagian, bukan hanya aksen; (3) Kiko hadir di Beranda dan bereaksi saat disentuh, bukan hanya di hero Landing; (4) mini game punya "dunia" (langit, awan, balon berkilau); (5) peta belajar jadi jalur nyata dengan simpul, bukan daftar kartu. Hasil `/impeccable critique` (26 Nov 2026): skor 26/40, arsip `.impeccable/critique/2026-11-26T07-12-20Z__frontend.md`.
- **Alasan:** Mapel hanya dibedakan teks, padahal anak kelas 1–2 (6–7 tahun) belum lancar membaca (PRD §9.1 poin 2: "minim teks, ikon + suara"). Token warna sudah ada tetapi nyaris tidak dipakai. Layar feedback benar sudah sesuai standar yang diinginkan; layar lain belum.
- **Prioritas:** bagus-jika-ada, tetapi sebaiknya sebelum layar Fase 3 dibangun (supaya tidak dibangun dua kali).
- **Analisis dampak:** *(draf oleh sesi Sonnet; belum ditinjau Opus — PRD §18 langkah 2. Minta `architect` meninjau sebelum keputusan jika perlu.)*
  - **PRD:** §9.1 poin 2 (tegaskan perbedaan per band kelas), §9.2 (tambah token turunan, mis. tint per mapel; token yang ada **tidak diubah**), §9.3 (daftar layar tetap), riwayat → v1.14. Palet dan font tidak berganti.
  - **Kode (sudah ada, Fase 2):** `frontend/src/styles/tokens.css` (token tint + token teks per mapel), `components/ui/SubjectCard.svelte` (ubin + ilustrasi; teks "Terkunci" di sana masih memakai `--color-ink-soft`), `Card`, `Button`, `Kiko`, `routes/Landing.svelte`, `routes/Home.svelte`, `contrast.test.ts`, test komponen terkait (`ui.component.test.ts`, `Landing.component.test.ts`).
  - **Test, dokumen, dan temuan gate yang ikut terpengaruh:** `tests/e2e/mockups.spec.ts` (mockup baru masuk uji 360/1280 px + axe), `routing.spec.ts`, `local-data.spec.ts`, `docs/mockups/README.md`, `docs/brand/tokens.md`, PRD §8.5 dan §14 (lingkup Fase 3 bertambah). Temuan gate Fase 2 **L-5** (badge "Gratis" di luar kartu) dan **L-3** (belum ada E2E 360 px) digabung ke task ubin.
  - **Kode (belum ada, Fase 3):** peta belajar, layar soal, feedback, game balon dibangun langsung dengan arah baru, bukan diubah belakangan.
  - **Aset baru:** ± 8 ilustrasi/ikon mapel (SVG buatan sendiri, gaya selaras Kiko) + latar game. Catat di `docs/ASSET_LICENSES.md`. Tanpa dependency baru.
  - **Mockup (Fase 1, sudah disetujui):** `beranda`, `beranda-besar`, `peta-belajar`, `landing`, `game-balon*` perlu versi baru dan **persetujuan visual ulang** Bimo sebelum dikodekan (mockup/perubahan besar tampilan = wajib tanya Bimo, CLAUDE.md).
  - **Budget performa (§8.1):** JS awal sekarang **34,38 KB** gzip dari 120 KB (PROGRESS T2.12), CSS awal 2,32 KB dari 25 KB. Ilustrasi **tidak boleh ditulis inline di komponen** (menambah JS awal): pakai pola Kiko (`?url` + `<img>`, `Kiko.svelte`) atau sprite, supaya masuk batas gambar ≤ 50 KB dan bisa lazy. Game dan ilustrasi besar tetap chunk lazy.
  - **Aksesibilitas:** teks di atas warna mapel penuh harus dicek ulang kontrasnya (AA 4,5:1); `prefers-reduced-motion` tetap dihormati; tidak ada info hanya lewat warna.
  - **Jumlah task:** ± 6–8. `/impeccable init` (PRODUCT.md) 1 · mockup baru 2–3 untuk disetujui · token tint + `SubjectCard` 1 · Landing + Home 1 · ilustrasi mapel 1 · Kiko interaktif + animasi 1 · layar Fase 3 mengikuti. Mayoritas `[sonnet]`. Tidak ada skema DB, API, auth, atau pembayaran.
  - **Risiko:**
    1. Kelas 5–6 harus tetap "tidak kekanak-kanakan" (§9.1). Mitigasi: aturan `[data-grade-band]` ada di `tokens.css:70-81`, tetapi **atribut itu belum dipasang di komponen mana pun** (`Home.svelte` memakai `class:big` untuk kelas ≤ 2). Perlu task: pasang `data-grade-band` dari `profile.active.grade` + test, lalu turunkan keceriaan (ilustrasi lebih kecil, warna lebih kalem) di kelas 5–6.
    1a. **Kontras warna mapel penuh (hasil tinjauan architect, rumus WCAG sama dengan `contrast.test.ts`):** tidak ada satu warna teks yang lolos 4,5:1 untuk semua mapel. Putih lolos hanya di Math (6,04) dan English (5,70); Ink gagal di keduanya (2,86 / 3,04) tetapi lolos di 6 mapel lain (Science 5,44, GP 6,24, Wellbeing 4,90, Art 7,34, Music 4,71, Computing 6,95). Perlu **token teks per mapel** (putih untuk Math/English, Ink untuk sisanya). `--color-ink-soft` gagal di atas Math (1,19), Teal (3,33), dan Bubblegum (3,76). Ilustrasi sebagai penanda utama anak yang belum membaca wajib ≥ 3:1 terhadap warna ubin (WCAG 1.4.11): Kiko oranye gagal di Art 1,20, Wellbeing 1,25, Music 1,30. Latar Sunny/Teal/Bubblegum aman dengan Ink (11,26 / 7,98 / 9,01), putih gagal. `contrast.test.ts` harus diperluas ke token teks per mapel, ink-soft, dan ilustrasi.
    1b. **Larangan §9.4** (buku, pensil, ABC, bola lampu, apel) tertulis hanya untuk logo, tetapi ikon mapel (English, Science) sangat mungkin memakai motif itu. Perlu keputusan Bimo (pertanyaan 5).
    2. Terlalu ramai membebani anak sensitif gerakan/visual. Mitigasi: animasi kecil dan mengikuti `prefers-reduced-motion`.
    3. Kontras gagal di warna terang (sunny, teal). Mitigasi: test kontras otomatis yang sudah ada diperluas ke token baru.
    4. Menyentuh Fase 2 yang sudah disetujui. Mitigasi: dikerjakan sebagai task awal Fase 3 (Fase 3 belum dimulai), bukan membuka kembali Fase 2.
  - **Fase aktif:** Fase 3 belum berjalan (`/plan-phase` belum dijalankan), sehingga tidak ada yang disela.
- **Pertanyaan untuk Bimo:**
  1. **Waktu:** kerjakan sebagai task awal Fase 3 (rekomendasi), atau tunda sampai demo selesai?
  2. **Kelas 5–6:** setuju keceriaan diturunkan per band kelas (rekomendasi), atau satu tampilan untuk semua kelas?
  3. **Ilustrasi:** dibuat Claude sebagai SVG selaras Kiko (rekomendasi, tanpa biaya lisensi), atau Bimo menyediakan ilustrator?
  4. **Landing:** halaman ini dibaca orang tua (pembeli). Ikut diubah penuh jadi ceria, atau hanya hero dan ubin mapel yang ceria sementara teks harga/FAQ tetap tenang (rekomendasi)?
  5. **Ikon mapel:** apakah larangan visual §9.4 (buku, pensil, ABC, bola lampu, apel) juga berlaku untuk ikon mapel? Jika ya, English dan Science perlu motif lain.
  6. **Suara:** di kelas 1–2, apakah mengetuk ubin mapel membacakan namanya (Web Speech, sesuai §9.1 "ikon + suara"; rekomendasi: ya)?
  - *Persetujuan mockup baru (Beranda + peta) oleh Bimo sebelum kode diubah tidak ditanyakan: sudah wajib menurut CLAUDE.md.*
- **Tinjauan architect (Opus), 26 Nov 2026:** **terima dengan perubahan isi**. Arah sesuai §9.1 poin 2 dan menaruhnya di awal Fase 3 tidak membuka kembali Fase 2 (§14 diperbarui lewat CR ini). Koreksi dari draf awal: angka budget JS (34,38 KB, bukan 21,14 KB), `data-grade-band` belum terpasang, kontras warna mapel penuh butuh token teks per mapel, ikon tidak boleh inline, file/test yang terlewat, dan 3 pertanyaan baru (4–6). Semuanya sudah dimasukkan di atas.
- **Rekomendasi (setelah tinjauan):** diterima, dijadwalkan sebagai task awal Fase 3, ± 5 task terpisah: (1) mockup Beranda + ubin mapel → persetujuan Bimo (gabung dengan B11); (2) token teks/tint per mapel + perluasan `contrast.test.ts`; (3) pasang `data-grade-band` dari grade profil + test; (4) `SubjectCard` + ikon via `?url`/sprite (sekaligus L-5, L-3); (5) Kiko di Beranda. **Dunia game dan peta jalur tidak jadi task sendiri**: masuk sebagai AC di task Fase 3 yang membangun layar itu, dengan mockup barunya disetujui lebih dulu. `/impeccable init` (PRODUCT.md) bersifat opsional, bukan task, karena tidak ada di struktur PRD §11. Alasan penjadwalan: sekarang hanya 3 layar live yang perlu diubah; menunda berarti peta, soal, dan game dibangun dengan gaya lama lalu diulang.
- **Keputusan Bimo:** diterima (26 Nov 2026, "setuju semua rekomendasi"). Jawaban:
  1. Waktu: task awal Fase 3.
  2. Kelas 5–6: keceriaan diturunkan per band kelas (`data-grade-band`).
  3. Ilustrasi: dibuat Claude sebagai SVG selaras Kiko.
  4. Landing: hanya hero dan ubin mapel yang ceria; harga/FAQ tetap tenang.
  5. Ikon mapel: larangan §9.4 (buku, toga, pensil, papan tulis, apel, huruf ABC, bola lampu) **berlaku juga untuk ikon mapel** (opsi B, 26 Nov 2026). English dan Science memakai motif lain, mis. balon bicara dan tabung reaksi/planet.
  6. Suara: di kelas 1–2, mengetuk ubin mapel membacakan namanya (Web Speech, progressive enhancement).
  Persetujuan mockup baru oleh Bimo tetap wajib sebelum kode (CLAUDE.md).
- **Status:** diterapkan di dokumen: PRD v1.14 (§9.1, §9.2, §14, riwayat) dan `PROGRESS.md` (backlog Fase 3). Kode menyusul sebagai task awal Fase 3 setelah `/plan-phase`.

## CR-009 — Auto-posting media sosial (Facebook, Instagram, TikTok)
- **Tanggal / Pengaju:** 27 Nov 2026 / Bimo
- **Deskripsi:** Perluas FR-14: selain menyiapkan konten, sistem otomatis memposting story, post, dan reel ke platform yang dipilih. Prioritas Instagram + Facebook (Meta Graph API), lalu TikTok (boleh lebih lama karena audit). Satu antarmuka adapter per platform agar platform baru mudah ditambah. **Aturan persetujuan:** brand awareness, tips, fakta, soal seru terbit otomatis; voucher, promo, angka kuota, testimoni, dan apa pun yang memuat harga wajib disetujui Bimo dulu. Item promo/kuota yang sudah disetujui **dibatalkan otomatis** jika kuota habis saat jadwal tiba. Desain lengkap: [superpowers/specs/2026-11-27-auto-posting-design.md](superpowers/specs/2026-11-27-auto-posting-design.md).
- **Alasan:** Konsistensi posting dan hemat waktu Bimo; unduh-upload manual dihilangkan.
- **Prioritas:** bagus-jika-ada
- **Analisis dampak:** *(draf sesi Sonnet; belum ditinjau Opus, PRD §18 langkah 2)*
  - **PRD:** §5.2 (hapus "Posting otomatis ke media sosial via API" dari Out of Scope), FR-14 (poin 5 "bukan auto-post" diubah; tambah FR auto-posting), §11/§12 (tabel `social_posts`, `social_accounts`), §13 (API admin), Fase 5 (task + Exit Criteria), riwayat versi.
  - **Skema DB (migrasi Phinx baru):** `social_posts`, `social_accounts` (token terenkripsi).
  - **Kode (belum ada):** `SocialPublisher` + adapter FB/IG/TikTok, cron `publish-due`, enkripsi token, OAuth, UI admin (lazy chunk), render video slideshow di browser admin.
  - **Jumlah task:** perkiraan kasar ±10–14, campuran `[opus]` (skema, token, adapter, keamanan) dan `[sonnet]` (UI admin, video).
  - **Risiko:** (1) token bocor, repo PUBLIC → `security-review` wajib; (2) promo/kuota basi terbit → hitung ulang di server sebelum kirim; (3) review app Meta dan audit TikTok lama dan di luar kendali kita; (4) video reel dari browser belum terbukti diterima platform; (5) generator FR-14 sekarang hanya gambar, video pekerjaan tambahan; (6) tindakan manual Bimo (B*): akun Meta Business, app developer Meta/TikTok.
  - **Fase aktif (3):** tidak mengganggu. Dibangun di Fase 5.
- **Keputusan Bimo:** desain disetujui 27 Nov 2026 (opsi C, pendekatan adapter, IG/FB dulu, batalkan otomatis jika kuota habis). Keputusan CR menunggu konfirmasi.
- **Status:** diusulkan. PRD belum diubah.
