# CR-001 — Aturan subagent & auto-merge PR

> **Status:** DISETUJUI Bimo (21 Nov 2026) — siap diterapkan.
> **Untuk Claude Code:** terapkan semua perubahan di bawah **persis** di branch `docs/cr-001-subagent-automerge`, naikkan PRD ke **v1.7**, catat CR-001 di `docs/PROGRESS.md` (dan di `docs/CHANGE_REQUESTS.md` jika sudah ada), lalu commit, PR, dan merge sesuai aturan auto-merge baru (perubahan ini sudah disetujui Bimo, jadi boleh di-merge tanpa bertanya lagi). File ini tetap disimpan sebagai arsip.

## Latar belakang

1. **Subagent liar.** Plugin superpowers punya skill yang membuat subagent sendiri (`subagent-driven-development`, `dispatching-parallel-agents`) dan worktree (`using-git-worktrees`). Kalau dipakai, subagent bisa berjalan paralel dengan model warisan sehingga kuota Pro cepat habis dan routing Opus/Sonnet (PRD §16.2) tidak terkontrol.
2. **Selalu ditanya merge.** Penyebabnya: (a) skill `superpowers:finishing-a-development-branch` memang selalu menawarkan pilihan (merge / PR / simpan / buang); (b) aturan lama "merge setelah CI hijau", padahal CI baru ada di T0.10; (c) Claude Desktop meminta izin setiap kali menjalankan perintah `gh pr merge`.

## Keputusan

- Eksekusi rencana dilakukan **langsung di sesi utama**. Subagent hanya 4 milik project, maksimal 1 berjalan bersamaan.
- **Auto-merge** jika semua syarat objektif terpenuhi. Bimo hanya ditanya untuk kategori berisiko.

---

## Perubahan 1 — PRD.md: sisipkan subbagian baru di akhir §16.2

Sisipkan tepat **sebelum** baris `### 16.3 Aturan hemat limit (WAJIB)`:

```markdown
#### Aturan subagent (WAJIB)

| Aturan | Isi |
|---|---|
| Subagent yang boleh dipakai | **Hanya 4 milik project:** `architect`, `reviewer` (Opus); `implementer`, `tester` (Sonnet). Tidak boleh memakai subagent umum (general-purpose, Explore, Plan) atau subagent bawaan plugin. |
| Jumlah | **Maksimal 1 subagent berjalan pada satu waktu.** Tidak ada eksekusi paralel. |
| Eksekusi rencana | Langsung di sesi utama memakai skill `superpowers:executing-plans`. **Tidak memakai** `superpowers:subagent-driven-development` dan `superpowers:dispatching-parallel-agents`. |
| Worktree | **Tidak memakai** `superpowers:using-git-worktrees`. Satu task = satu branch di folder utama (worktree membingungkan di Windows + XAMPP). |
| Kapan delegasi | Sesuai tag task (`[opus]` → `architect`) dan aturan eskalasi di atas. Task `[sonnet]` sebaiknya dikerjakan sesi utama; `implementer`/`tester` dipakai hanya bila task besar dan bisa dipisah dengan jelas. |
| Konflik dengan skill | Jika sebuah skill (superpowers atau lainnya) menyarankan membuat subagent, worktree, atau menjalankan agen paralel, **aturan di tabel ini yang berlaku**. |
```

## Perubahan 2 — PRD.md: ganti baris `| PR |` di tabel §17.5 dan tambahkan subbagian auto-merge

Ganti baris yang dimulai `| PR | Dibuat oleh Claude Code (`gh pr create`) ...` dengan:

```markdown
| PR | Dibuat oleh Claude Code (`gh pr create`) setelah task selesai. Deskripsi berisi: task dari `PROGRESS.md`, ringkasan perubahan, bukti test. **Di-merge otomatis oleh Claude** jika memenuhi aturan auto-merge di bawah; selain itu menunggu Bimo. |
```

Lalu sisipkan subbagian ini tepat **setelah** tabel "Branch & alur kerja" di §17.5 (sebelum paragraf **GitHub Secrets**):

```markdown
#### Aturan auto-merge

Claude **langsung merge tanpa bertanya** (`gh pr merge <nomor> --squash --delete-branch`, lalu `git switch main && git pull`) jika **SEMUA** syarat ini terpenuhi:

1. Acceptance criteria task terpenuhi dan perintah verifikasi (lint, typecheck, test) sudah dijalankan dengan hasil **lolos**, output ditampilkan di laporan/PR.
2. **CI hijau** di PR. Sebelum CI ada (sebelum T0.10 selesai): semua pemeriksaan lokal yang relevan lolos.
3. Isi PR hanya untuk task itu (tidak ada perubahan di luar scope).
4. Tidak ada pertanyaan terbuka atau temuan `reviewer` yang belum diselesaikan.
5. PR **bukan** kategori "wajib review Bimo" di bawah.

**Wajib review Bimo (Claude bertanya dulu, tidak auto-merge):**

| Kategori | Contoh |
|---|---|
| Aturan & dokumen inti | Perubahan `PRD.md`, `CLAUDE.md`, isi `.claude/` (kecuali yang berasal dari CR yang sudah disetujui Bimo) |
| Skema & data | Migrasi database baru |
| Keamanan & uang | Auth, sesi, Parent Gate, entitlement, pembayaran, webhook, harga/kuota early bird |
| Deploy & rahasia | Workflow deploy ke hosting, pengaturan secrets |
| Visual yang harus dilihat | Mockup & logo (Fase 1), perubahan besar tampilan |
| Phase gate | Persetujuan fase selalu oleh Bimo ("Fase X disetujui") |
| Dependabot | Update **major**. Update patch/minor dengan CI hijau boleh auto-merge. |

**Setelah auto-merge:** laporan akhir task menyebut "PR #N sudah di-merge otomatis" + ringkasan. Jika Bimo ingin membatalkan: `Batalkan PR #N` → Claude membuat PR revert.

**Skill `superpowers:finishing-a-development-branch`:** jangan tampilkan pilihan merge/PR/simpan/buang ke Bimo. Ikuti aturan auto-merge ini: PR lalu auto-merge, atau PR lalu tanya Bimo bila termasuk kategori wajib review.

**Setelah CI & branch protection aktif (T0.10 + B8):** gunakan `gh pr merge <nomor> --squash --auto --delete-branch` agar GitHub yang merge begitu CI hijau. Syarat: Settings → General → centang **Allow auto-merge**.
```

## Perubahan 3 — PRD.md: header & riwayat versi

- Header: `**Versi:** 1.6` → `**Versi:** 1.7`.
- Tambahkan baris di tabel Riwayat Versi:

```markdown
| 1.7 | 21 Nov 2026 | CR-001: aturan subagent (hanya 4 subagent project, maks. 1 bersamaan, eksekusi inline, tanpa worktree; §16.2) dan aturan auto-merge PR dengan daftar kategori wajib review Bimo (§17.5). |
```

## Perubahan 4 — CLAUDE.md

**(a)** Di bagian `## Model routing OTOMATIS`, tambahkan setelah baris "Jangan pernah set `CLAUDE_CODE_SUBAGENT_MODEL`.":

```markdown
- **Subagent:** hanya `architect`, `reviewer`, `implementer`, `tester`; **maksimal 1 bersamaan**, tidak paralel. Eksekusi rencana di sesi utama (`superpowers:executing-plans`). **Jangan pakai** `subagent-driven-development`, `dispatching-parallel-agents`, `using-git-worktrees`, atau subagent umum/bawaan plugin. Jika skill menyarankan sebaliknya, aturan ini yang berlaku (PRD §16.2).
```

**(b)** Di bagian `## Git & GitHub`, ganti bullet pertama dengan:

```markdown
- Jangan push langsung ke `main`. Satu task = satu branch (`feat/f<fase>-<nama>`, `fix/...`, `docs/...`) → PR via `gh pr create` dengan bukti test.
- **Auto-merge (PRD §17.5):** jika AC terpenuhi, verifikasi lolos, CI hijau (sebelum T0.10: cek lokal lolos), scope sesuai task, tidak ada pertanyaan terbuka, dan bukan kategori wajib review → **langsung** `gh pr merge <n> --squash --delete-branch`, lalu `git switch main && git pull`, tanpa bertanya. Laporkan "PR #N di-merge otomatis".
- **Wajib tanya Bimo dulu:** perubahan PRD/CLAUDE.md/.claude (kecuali dari CR yang sudah disetujui), migrasi DB, auth/pembayaran/webhook/harga, workflow deploy/secrets, mockup/logo/perubahan besar tampilan, Dependabot major, phase gate.
- Saat skill `superpowers:finishing-a-development-branch` aktif: **jangan** tampilkan menu pilihan; ikuti aturan auto-merge di atas.
```

## Perubahan 5 — docs/PANDUAN_VIBE_CODING.md

**(a)** Di `### B. Setiap task selesai`, ganti paragraf pembuka + langkah 1–2 menjadi:

```markdown
Claude akan melapor: apa yang dikerjakan, bukti test, dan status PR. Ada dua kemungkinan:

- **"PR #N sudah di-merge otomatis"** → task aman dan sudah masuk `main`. Kamu cukup cek hasilnya sekilas (bagian 6) kalau mau, lalu buka **sesi baru** → `/next`.
- **"PR #N menunggu review Bimo"** → task ini termasuk kategori penting (database, keamanan, pembayaran, desain, deploy, atau perubahan aturan). Cek hasilnya, lalu balas `Merge PR #N` atau jelaskan apa yang harus diperbaiki.

Kalau ternyata hasil yang sudah di-merge otomatis tidak sesuai, ketik `Batalkan PR #N`. Claude akan membatalkannya dengan PR revert.
```

**(b)** Tambahkan subbagian baru di `## 7. Situasi khusus & prompt-nya`:

```markdown
### Kapan aku masih ditanya soal merge?

Claude merge sendiri jika semua test lolos dan task-nya tidak berisiko. Kamu tetap ditanya untuk: perubahan PRD/aturan, database, login/keamanan/pembayaran, desain (mockup, logo), deploy, update library versi besar, dan persetujuan fase.

Kalau Claude Desktop menampilkan **dialog izin** untuk perintah `gh pr merge` atau `git push`, pilih **"Always allow"**. Itu izin aplikasi, bukan pertanyaan merge, dan cukup sekali.
```

**(c)** Di `## 8. Kumpulan prompt cepat`, tambahkan baris:

```markdown
| Setujui PR yang menunggu | `Merge PR #N` |
| Batalkan PR yang sudah di-merge | `Batalkan PR #N` |
```

**(d)** Di `## 9. Boleh & jangan` bagian **Jangan**, tambahkan:

```markdown
- Meminta Claude "pakai banyak agent paralel" atau "kerjakan pakai worktree". Project ini sengaja memakai maksimal 1 subagent agar kuota awet (PRD §16.2).
```

**(e)** Di `## 4` → `### A. Mulai hari`, tambahkan di prompt "Mulai hari" (sebelum "Lalu jalankan /next."):

```
Jika ada PR yang masih terbuka, selesaikan dulu sesuai aturan auto-merge (atau tanyakan aku bila wajib review).
```
