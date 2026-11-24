# CR-003 — Tambah skill: ponytail, graphify, ECC (selektif)

> **Status:** DIUSULKAN oleh Bimo (23 Nov 2026). Rekomendasi sudah dianalisis, menunggu persetujuan Bimo.
> **Untuk Claude Code:** setelah Bimo menulis "CR-003 disetujui", terapkan semua perubahan di bawah **persis** di branch `docs/cr-003-skills`, naikkan PRD ke **v1.9**, catat CR-003 di `docs/CHANGE_REQUESTS.md` dan `docs/PROGRESS.md`, lalu jalankan instalasi Bagian B. Perubahan ini mengubah `PRD.md`, `CLAUDE.md`, dan `.claude/`, jadi PR-nya **wajib review Bimo** (PRD §17.5), kecuali Bimo sudah menyetujui CR ini lebih dulu.
> **Keamanan:** sebelum memasang, baca dulu `SKILL.md`, file hook, dan script di setiap repo. Jika ada perintah yang mengirim data keluar, menghapus file, atau memasang hook global, berhenti dan laporkan ke Bimo.

## Ringkasan analisis

| Skill | Apa itu | Cocok untuk StudyKids? | Keputusan |
|---|---|---|---|
| **ponytail** (`DietrichGebert/ponytail`, MIT) | Satu prompt yang membuat agent menulis kode seminimal mungkin. Urutan berpikirnya: perlu dibuat? → sudah ada di codebase? → ada di standard library? → solusi paling kecil yang jalan. Ada command `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, `/ponytail-gain`. Klaim penulisnya: −45% token. | **Ya.** Sejalan dengan PRD (kode efisien, kurangi refactor, budget bundle 120 KB, hemat kuota Pro). Tetap menjaga validasi, keamanan, aksesibilitas. | **Pasang sekarang** (plugin, scope project). |
| **graphify** (`Graphify-Labs/graphify`, Apache-2.0/MIT) | CLI Python yang membuat knowledge graph dari codebase. Agent bisa bertanya "fungsi X dipakai di mana" tanpa membaca banyak file. Memasang hook sebelum setiap pencarian, dan bisa memasang git hook. | **Nanti.** Saat ini codebase masih kecil (scaffold Fase 0), jadi graph belum menghemat apa-apa. Butuh Python 3.11+ & `uv` (dependency baru di laptop), plus hook di setiap pencarian. Mulai berguna saat kode sudah besar (Fase 4–5). | **Jadwalkan di awal Fase 4** (task evaluasi). Mode lokal & code-only saja. |
| **ECC** (`affaan-m/ECC`, MIT) | Koleksi raksasa: 72 agent, 328 skill, 99 command, hooks, memory, rules. | **Tidak sebagai paket penuh.** Bertabrakan dengan keputusan project: aturan subagent CR-001 (hanya 4 agent), keputusan tanpa plugin memori (v1.6), skill TDD/review yang sudah ada di superpowers, hooks setiap sesi, dan rules yang selalu dimuat (boros kuota Pro). | **Pasang selektif 1 skill saja: `security-review`** (berguna untuk auth Fase 4 & pembayaran Fase 6). Tanpa hooks, rules, agent, memory, command. |

---

## Bagian A — Perubahan dokumen

### A1. PRD.md §16.4 — tambahkan baris ke tabel (sebelum baris `~~claude-mem~~`)

```markdown
| Plugin | **ponytail** (kode minimal, `/ponytail-review`, `/ponytail-audit`) | `claude plugin marketplace add DietrichGebert/ponytail` lalu `claude plugin install ponytail@ponytail --scope project` | `.claude/settings.json` → `enabledPlugins` + `extraKnownMarketplaces` |
| Skill | **security-review** (dari ECC, selektif) | Salin hanya folder skill `security-review` dari `github.com/affaan-m/ECC` ke `.claude/skills/security-review/` (tanpa hooks/rules/agents/memory). Catat commit sumber di `docs/DECISIONS.md`. | `.claude/skills/` |
| Skill | **graphify** (knowledge graph codebase) | **Dijadwalkan awal Fase 4** (task evaluasi, lihat §16.4.2). Belum dipasang. | — |
| Plugin | ~~ECC paket penuh~~ | **Tidak dipakai.** Bertabrakan dengan aturan subagent (§16.2), keputusan tanpa plugin memori, duplikat superpowers, hooks & rules boros kuota. Hanya skill `security-review` yang diambil. | — |
```

### A2. PRD.md — sisipkan subbagian baru tepat setelah paragraf "**Catatan teknis:**" di §16.4

```markdown
#### 16.4.1 Kapan memakai skill apa (berlaku untuk Opus & Sonnet, sesi utama & subagent)

**Urutan prioritas:** PRD & CLAUDE.md (termasuk DoD) → skill proses superpowers (brainstorming, writing-plans, TDD, systematic-debugging, verification) → skill implementasi (ponytail, impeccable, security-review). Jika skill bertentangan dengan PRD, **PRD yang berlaku**.

| Situasi | Skill yang WAJIB dipakai |
|---|---|
| Merencanakan fase / task baru | `superpowers:writing-plans` (+ `brainstorming` bila ada keputusan desain) |
| Menulis kode apa pun (fitur, generator, komponen, backend) | `superpowers:test-driven-development` + **`ponytail`** (pilih solusi paling sederhana yang memenuhi AC) |
| Membuat/mengubah UI | `impeccable` + `ponytail` (konteks desain: `PRODUCT.md`, `DESIGN.md`) |
| Bug | `superpowers:systematic-debugging` |
| Sebelum bilang selesai | `superpowers:verification-before-completion` |
| Review akhir task besar & `/gate` | `/ponytail-review` (kode berlebihan/tidak perlu) + `superpowers:requesting-code-review` |
| Auth, sesi, Parent Gate, entitlement, pembayaran, webhook, harga/kuota | **`security-review`** (wajib, oleh `architect` saat implementasi dan `reviewer` saat gate) |
| Menjelajah codebase besar (mulai Fase 4, jika graphify lolos evaluasi) | `graphify` (query graph dulu sebelum membaca banyak file) |

**Batas ponytail (WAJIB):** ponytail **tidak boleh** menjadi alasan untuk menghapus atau melewati test, i18n (teks ID/EN), design token, aksesibilitas (§8.5), validasi server, cek anti-IDOR, atau apa pun yang diwajibkan AC/DoD. "Minimal" artinya tanpa kode, abstraksi, dan dependency yang tidak perlu, bukan tanpa kualitas.

**Subagent:** skill yang relevan dimuat lewat field `skills:` di frontmatter `.claude/agents/*.md` (lihat CR-003 Bagian A4), sehingga subagent Opus/Sonnet otomatis memakainya tanpa perlu diingatkan.

#### 16.4.2 Rencana graphify (evaluasi di awal Fase 4)

- Prasyarat: Python 3.11+ dan `uv` (`winget install astral-sh.uv`), dicek & dipasang lewat BOOTSTRAP.
- Pasang: `uv tool install graphifyy` → `graphify install --project` (scope project).
- **Mode code-only lokal:** tidak memproses PDF/dokumen/gambar (pass semantik memakai token), **tidak** memakai Graphify Cloud / hosted MCP, **tidak** memasang git hook pada awalnya.
- `graphify-out/` WAJIB masuk `.gitignore`.
- Kriteria lolos evaluasi (dicatat di `DECISIONS.md`): pada 3 task eksplorasi yang sama, pemakaian token/jumlah file yang dibaca turun nyata dibanding tanpa graphify, dan tidak ada error di Windows. Jika tidak lolos → uninstall, catat alasannya.
```

### A3. PRD.md — header & riwayat versi

- Header `**Versi:** 1.8` → `**Versi:** 1.9`.
- Tambah baris riwayat:

```markdown
| 1.9 | 23 Nov 2026 | CR-003: tambah plugin **ponytail** (kode minimal) dan skill **security-review** (selektif dari ECC); **graphify** dijadwalkan evaluasi di awal Fase 4; ECC paket penuh tidak dipakai. Tabel "kapan memakai skill apa" + batas ponytail (§16.4.1–16.4.2). |
```

### A4. `.claude/agents/*.md` — tambahkan field `skills:` di frontmatter

Tambahkan baris `skills:` (format list YAML) di frontmatter, di bawah `model:`:

| File | `skills:` |
|---|---|
| `architect.md` | `ponytail`, `security-review` |
| `implementer.md` | `ponytail` |
| `tester.md` | (tidak perlu) |
| `reviewer.md` | `ponytail`, `security-review` |

Contoh untuk `implementer.md`:

```yaml
---
name: implementer
description: ...(tetap)...
model: sonnet
skills:
  - ponytail
---
```

Jika nama skill hasil instalasi berbeda (misalnya `ponytail:ponytail`), pakai nama yang muncul di daftar skill Claude Code, lalu catat di `DECISIONS.md`. Di badan `reviewer.md`, tambahkan langkah: "Jalankan `/ponytail-review` pada perubahan fase ini dan `security-review` untuk area keamanan; masukkan temuannya ke laporan gate."

### A5. CLAUDE.md — tambahkan bagian baru setelah `## Aturan coding`

```markdown
## Skill wajib (PRD §16.4.1)

- Prioritas: PRD/CLAUDE.md → skill proses superpowers → ponytail / frontend-design / security-review.
- Menulis kode: TDD + **ponytail** (solusi paling sederhana yang memenuhi AC). ponytail **tidak boleh** memangkas test, i18n, token, aksesibilitas, validasi, anti-IDOR, atau apa pun yang diwajibkan DoD.
- Area auth/sesi/Parent Gate/entitlement/pembayaran/webhook/harga: **wajib `security-review`**.
- Review task besar & `/gate`: `/ponytail-review` + review superpowers.
- graphify belum dipakai (evaluasi awal Fase 4). ECC paket penuh **dilarang**; hanya skill `security-review`.
```

### A6. `docs/setup/BOOTSTRAP.md`

- Langkah 2 (plugin): tambahkan
  ```powershell
  claude plugin marketplace add DietrichGebert/ponytail
  claude plugin install ponytail@ponytail --scope project
  ```
- Langkah 3 (skills): tambahkan
  ```powershell
  git clone --depth 1 https://github.com/affaan-m/ECC "$env:TEMP\ecc"
  # cari folder skill security-review di repo, baca SKILL.md-nya, lalu salin HANYA folder itu:
  Copy-Item -Recurse "$env:TEMP\ecc\<path>\security-review" ".claude\skills\security-review"
  Remove-Item -Recurse -Force "$env:TEMP\ecc"
  ```
  Larangan: jangan jalankan installer ECC (`install.ps1`, `npx ecc-universal ...`) dan jangan menyalin hooks/rules/agents/memory.
- Tambahkan baris hasil: `ponytail`, `security-review`.
- `scripts/doctor.mjs`: tambahkan cek bahwa plugin ponytail aktif dan `.claude/skills/security-review/SKILL.md` ada (task kecil `[sonnet]`).

### A7. docs/PANDUAN_VIBE_CODING.md

**(a)** Di `## 8. Kumpulan prompt cepat`, tambahkan:

```markdown
| Cek kode berlebihan di task terakhir | `/ponytail-review` |
| Audit kode yang terlalu rumit di seluruh project | `/ponytail-audit` |
| Lihat penghematan dari ponytail | `/ponytail-gain` |
```

**(b)** Di `## 7. Situasi khusus & prompt-nya`, tambahkan subbagian:

```markdown
### Skill tambahan yang dipakai project ini

Claude memakai skill ini otomatis. Kamu tidak perlu memanggilnya, kecuali command yang ditandai.

| Skill | Gunanya | Kapan |
|---|---|---|
| superpowers | Cara kerja disiplin: rencana, test dulu, debug sistematis, verifikasi | Setiap task |
| ponytail | Menulis kode sesederhana mungkin, tanpa tambahan yang tidak perlu | Setiap menulis kode. Kamu bisa memanggil `/ponytail-review` kapan saja |
| frontend-design | Kualitas tampilan | Task UI |
| security-review | Mengecek celah keamanan | Login, akun, pembayaran (Fase 4 & 6) |
| graphify | Peta codebase supaya Claude tidak perlu membaca banyak file | Dievaluasi di awal Fase 4 |

Kalau Claude terasa "terlalu minimal" (misalnya melewatkan teks bahasa Inggris atau test), tulis: `Ingat batas ponytail di CLAUDE.md: test, i18n, aksesibilitas, dan validasi tetap wajib.`
```

**(c)** Di `## 9. Boleh & jangan` bagian **Jangan**, tambahkan:

```markdown
- Memasang ECC versi lengkap atau skill dari internet sendiri tanpa `/cr`. Skill baru bisa menambah pemakaian kuota di setiap sesi dan bertabrakan dengan aturan project.
```

---

## Bagian B — Instalasi (setelah dokumen di-merge)

1. Jalankan langkah baru di BOOTSTRAP (A6) untuk ponytail & security-review. Minta izin Bimo per instalasi.
2. Perbarui frontmatter agent (A4) dan doctor.
3. Minta Bimo **membuka sesi baru**. Di sesi baru, verifikasi: daftar skill memuat `ponytail` & `security-review`, `/ponytail-help` jalan, dan doctor bersih.
4. Tambahkan task evaluasi graphify ke rencana Fase 4 (`[sonnet]`, sesuai §16.4.2).
