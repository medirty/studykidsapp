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

## CR-001 — Aturan subagent & auto-merge PR
- **Tanggal / Pengaju:** 21 Nov 2026 / Bimo
- **Deskripsi:** Subagent hanya 4 milik project (`architect`, `reviewer`, `implementer`, `tester`), maksimal 1 berjalan bersamaan. Rencana dieksekusi di sesi utama, tanpa worktree. PR di-merge otomatis jika syarat objektif terpenuhi; Bimo hanya ditanya untuk kategori berisiko.
- **Alasan:** Skill plugin superpowers bisa membuat subagent paralel dan worktree sendiri sehingga kuota Pro cepat habis dan routing model tidak terkontrol. Merge juga terlalu sering ditanyakan.
- **Prioritas:** wajib
- **Keputusan Bimo:** diterima sekarang (21 Nov 2026)
- **Status:** diterapkan di PRD v1.7 (§16.2, §17.5), `CLAUDE.md`, `docs/PANDUAN_VIBE_CODING.md`. Arsip rinci: [plans/CR-001-subagent-dan-auto-merge.md](plans/CR-001-subagent-dan-auto-merge.md).
