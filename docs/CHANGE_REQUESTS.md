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
