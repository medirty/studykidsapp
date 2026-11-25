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
