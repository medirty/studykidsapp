# CR-004 — Ganti database lokal: XAMPP (MariaDB 10.4) → MariaDB 11.8 standalone

> **Status:** DISETUJUI Bimo (23 Nov 2026), dengan syarat **deploy tidak boleh jadi lebih susah**.
> **Untuk Claude Code:** kerjakan di branch `chore/cr-004-mariadb`, sebelum T0.12 dan `/gate` Fase 0, dengan urutan Bagian A → B → C. **Bimo minta "terima jadi": Claude mengerjakan SEMUA langkah sendiri**, termasuk stop XAMPP, install MariaDB, password, user & database. Bimo hanya mengklik **Yes/Allow** pada dialog izin Windows (UAC) dan dialog izin Claude Desktop. Jangan meminta Bimo mengetik perintah, mengisi installer, atau memasukkan password. CR ini sudah disetujui, jadi PR-nya boleh **auto-merge** (sesuai CR-001) jika CI hijau dan isinya persis sesuai CR ini. Naikkan PRD ke **v1.10**, lalu catat di `docs/CHANGE_REQUESTS.md` dan `docs/PROGRESS.md`.

## Alasan

| | Versi database |
|---|---|
| XAMPP 8.2.12 (rilis terakhir, Nov 2023) | MariaDB **10.4.32**, sudah tidak didukung sejak Juni 2024 |
| CI saat ini (`ci.yml`) | **MySQL 8.0**, produk yang berbeda |
| Hostinger (produksi) | MariaDB **11.8** (contoh dari dokumentasi Hostinger: `11.8.9-MariaDB`) |

Saat ini laptop, CI, dan produksi memakai **tiga database yang berbeda**. Setelah CR ini, ketiganya sama-sama **MariaDB 11.8**. Bonusnya, MariaDB berjalan sebagai service Windows (otomatis menyala), jadi Bimo tidak perlu lagi membuka XAMPP setiap hari.

## Dampak ke deploy (syarat Bimo)

**Deploy tidak jadi lebih susah, malah lebih aman:**

- Proses deploy tidak pernah memakai XAMPP. Alurnya tetap: build frontend → upload; backend → `public_html/api`; `phinx migrate` lewat SSH (PRD §17.2). Tidak ada langkah deploy yang berubah.
- Versi database lokal = CI = Hostinger, jadi bug "jalan di laptop tapi error di server" karena beda versi tidak terjadi.
- Koneksi database mengatur sendiri `charset`, `collation`, `sql_mode`, dan zona waktu (Bagian B5). Perilaku app tidak bergantung pada setelan default server mana pun, termasuk kalau Hostinger mengubah setelannya.

---

## Bagian A — Instalasi otomatis oleh Claude (Bimo hanya klik "Yes")

**Yang tetap butuh klik Bimo (tidak bisa dan tidak boleh dilewati):** dialog **UAC Windows** ("Do you want to allow this app to make changes?") saat MariaDB dipasang sebagai service, dan dialog izin perintah di Claude Desktop. Pilih **Yes** / **Always allow**. Selain itu Bimo tidak mengerjakan apa pun.

A1. **Stop MySQL XAMPP.** Cek proses `mysqld.exe` dari `C:\xampp`. Jika jalan, hentikan (`Stop-Process` hanya untuk proses dengan path `C:\xampp\mysql\bin\mysqld.exe`). Di `C:\xampp\xampp-control.ini`, pastikan autostart MySQL = 0. Jangan uninstall XAMPP.

A2. **Buat password root acak** (≥ 24 karakter) di PowerShell. Jangan tampilkan di chat, jangan tulis ke repo.

A3. **Install MariaDB 11.8 LTS tanpa dialog installer**:
- Utama: `winget show MariaDB.Server --versions` → pilih versi `11.8.x` terbaru →
  `winget install --id MariaDB.Server --version <11.8.x> -e --silent --accept-package-agreements --accept-source-agreements --override "/qn SERVICENAME=MariaDB PORT=3306 UTF8=1 PASSWORD=<root>"`
- Jika versi 11.8 tidak ada di winget: unduh MSI 11.8 LTS (Windows x86_64) dari mariadb.org, lalu `Start-Process msiexec -Verb RunAs -Wait -ArgumentList '/i "<file.msi>" /qn SERVICENAME=MariaDB PORT=3306 UTF8=1 PASSWORD=<root>'`.
- HeidiSQL ikut terpasang secara default oleh MSI. Jika tidak, `winget install --id HeidiSQL.HeidiSQL -e --silent`.

A4. **Simpan password root di luar repo**: `%USERPROFILE%\.studykids\mariadb-root.txt`, dengan akses file hanya untuk user Windows Bimo (`icacls` menghapus pewarisan dan memberi akses hanya ke `%USERNAME%`). Beri tahu Bimo lokasinya dalam satu kalimat. Password ini hanya dipakai `db-setup.ps1`.

A5. **Jalankan `scripts/db-setup.ps1` (B3) sendiri.** Script membaca password root dari file A4 (atau dari `Read-Host` jika file tidak ada), membuat user `studykids` dengan password acak, membuat DB dev & test, lalu mengisi `backend/.env`.

A6. **Jika ada langkah yang gagal** (misalnya UAC ditolak atau tidak ada koneksi): coba ulang sekali. Jika tetap gagal, jelaskan ke Bimo dalam bahasa sederhana apa yang dibutuhkan (maksimal satu klik/aksi), sesuai protokol CR-002. Jangan biarkan Bimo menebak.

## Bagian B — Yang dikerjakan Claude Code

### B1. Persiapan
- Pastikan port 3306 bebas (MySQL XAMPP sudah di-stop).
- Instalasi sudah dikerjakan di Bagian A (otomatis, tanpa dialog installer).

### B2. Verifikasi instalasi
```powershell
& "C:\Program Files\MariaDB 11.8\bin\mariadb.exe" --version     # harus 11.8.x
Get-Service MariaDB | Select-Object Status, StartType            # Running, Automatic
```
Jika folder instalasinya berbeda, pakai path yang ada dan catat di `docs/DECISIONS.md`.

### B3. `scripts/db-setup.ps1` (baru)
Script PowerShell yang (dijalankan oleh Claude, bukan Bimo):
1. Membaca password root dari `%USERPROFILE%\.studykids\mariadb-root.txt`. Jika file tidak ada, meminta lewat `Read-Host -AsSecureString`.
2. Membuat password acak kuat untuk user `studykids`.
3. Membuat `studykids_dev` dan `studykids_test` dengan `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, membuat user `'studykids'@'localhost'`, dan memberi hak penuh hanya ke kedua DB itu.
4. Menulis `DB_USER`, `DB_PASS`, `DB_HOST=127.0.0.1`, `DB_PORT=3306` ke `backend/.env` (file ini di-ignore Git), tanpa menghapus isi lain.
5. Bisa dijalankan ulang dengan aman (idempotent: `CREATE ... IF NOT EXISTS`, password user di-reset bila diminta).

Setelah dijalankan: `npm run db:reset`, lalu `npm run dev` → hello-world menampilkan **API ok, DB ok** (bukti dicek Claude sendiri, misalnya lewat Playwright atau `curl /api/health`).

### B4. PATH & lokasi client
- Hapus `C:\xampp\mysql\bin` dari PATH **user**, lalu tambahkan `C:\Program Files\MariaDB 11.8\bin` (berlaku setelah Claude Desktop di-restart).
- Script project tidak bergantung pada PATH: tambahkan `DB_CLIENT_BIN` (opsional) di `backend/.env.example`. `doctor.mjs` dan `db-reset.mjs` mencari client dengan urutan: `DB_CLIENT_BIN` → `C:\Program Files\MariaDB 11.8\bin\mariadb.exe` → `mysql`/`mariadb` di PATH.

### B5. Koneksi database tahan-beda-server (`backend/src/Support/Database.php`)
Setelah koneksi PDO dibuat, set sesi secara eksplisit:
```sql
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ZERO_DATE,NO_ZERO_IN_DATE,NO_ENGINE_SUBSTITUTION';
SET SESSION time_zone = '+00:00';
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
```
- Semua waktu disimpan dalam **UTC**. Konversi ke WIB hanya di tampilan. Ini penting untuk kedaluwarsa order 60 menit dan kuota early bird.
- `phinx.php` sudah memakai `utf8mb4` / `utf8mb4_unicode_ci`. Pertahankan. Setiap migrasi tabel baru WAJIB memakai collation ini secara eksplisit.
- Tambahkan test PHPUnit: setelah koneksi, `SELECT @@SESSION.time_zone, @@SESSION.sql_mode` sesuai nilai di atas.

### B6. CI (`.github/workflows/ci.yml`)
Ganti service `mysql:8.0` dengan:
```yaml
    services:
      mariadb:
        image: mariadb:11.8
        env:
          MARIADB_ROOT_PASSWORD: root
          MARIADB_DATABASE: studykids_test
        ports: ['3306:3306']
        options: >-
          --health-cmd="healthcheck.sh --connect --innodb_initialized"
          --health-interval=10s --health-timeout=5s --health-retries=10
```
Nama check CI berubah hanya jika nama job berubah. **Jangan ubah nama job** supaya branch protection (B8) tetap cocok.

### B7. Doctor, test, dan dokumen setup
- `scripts/doctor.mjs`: ganti cek "MySQL client XAMPP" & saran "Start MySQL di XAMPP" menjadi: client MariaDB ditemukan (B4), versi server **11.8.x** (`SELECT VERSION()`), service `MariaDB` Running & Automatic, login `studykids` ke DB dev & test. Saran perbaikan merujuk `docs/SETUP_LOCAL.md`. Perbarui `scripts/lib/doctor-utils.test.mjs`.
- `docs/SETUP_LOCAL.md`: tulis ulang Langkah 3–5 → "Install MariaDB 11.8 (MSI)" + "Jalankan `scripts/db-setup.ps1`". Hapus instruksi XAMPP. Perbarui tabel troubleshooting.
- `docs/setup/BOOTSTRAP.md`: S7 = client MariaDB 11.8 ada; S8 = service `MariaDB` Running; S9 = folder bin MariaDB di PATH user.
- `README.md`: baris SETUP_LOCAL → "(Windows + MariaDB 11.8)".
- `backend/.env.example`: komentar "Database MariaDB 11.8 (sama dengan Hostinger). Pakai user khusus, bukan root." + `DB_CLIENT_BIN=`.

### B8. Bersih-bersih
- Database di XAMPP tidak perlu dipindahkan (isinya hanya data uji, dibuat ulang lewat `db:reset`).
- **Rollback** jika MariaDB bermasalah: start MySQL di XAMPP lagi, kembalikan `backend/.env`. Tidak ada data yang hilang.

---

## Bagian C — Perubahan dokumen

### C1. PRD.md
- **K9** (tabel §4.1): ganti isi kolom Keputusan dan Alasan menjadi:
  `| K9 | **Dev lokal: MariaDB 11.8 standalone** (service Windows, versi sama dengan Hostinger) + PHP 8.4 di `C:\php-8.4`; server dijalankan dari terminal (`npm run dev`). XAMPP tidak dipakai (CR-004). Tanpa MCP database. | Laptop = CI = produksi (MariaDB 11.8), tidak perlu start manual, Claude Code akses DB lewat CLI. Detail §17.1. |`
- **§10.1 baris Database** →
  `| Database | **MariaDB 11.8** (bawaan Hostinger; lokal & CI memakai versi yang sama) | Gratis termasuk paket hosting. Koneksi mengatur charset/collation/sql_mode/zona waktu sendiri agar perilaku sama di semua server. |`
- **§17.1 tabel Environment, baris Local** →
  `| **Local** | Laptop Bimo (Windows) — MariaDB 11.8 (service) + PHP 8.4 + Node, dijalankan dengan `npm run dev` | Pengembangan |`
- **§17.1 "Setup dev lokal (keputusan K9)"**: ganti paragraf **Keputusan** dengan:
  `**Keputusan (CR-004):** database lokal memakai **MariaDB 11.8 standalone** sebagai service Windows, versi yang sama dengan Hostinger dan CI. XAMPP tidak dipakai lagi (MariaDB 10.4 bawaannya sudah tidak didukung dan berbeda versi dengan produksi). Lihat data manual dengan **HeidiSQL** (ikut terinstall).`
  Lalu di tabel komponen:
  - baris **Database** → `MariaDB 11.8 (MSI dari mariadb.org), service `MariaDB` otomatis menyala, port 3306. DB `studykids_dev` & `studykids_test`, user `studykids` (bukan root), dibuat dengan `scripts/db-setup.ps1`.`
  - baris **Akses DB oleh Claude Code** → ganti contoh `mysql ...` menjadi `mariadb -u studykids -p studykids_dev -e "..."`.
  - baris **Lihat data manual** → `HeidiSQL (ikut installer MariaDB). phpMyAdmin/XAMPP tidak dipakai.`
- **§17.1 tabel "Status laptop Bimo"**: baris MySQL client & server diganti menjadi satu baris
  `| MariaDB 11.8 (service) | Dipasang lewat CR-004 | `npm run doctor` hijau |`.
- **§17.2 tabel perbandingan**: tambahkan baris `| Database | MariaDB 11.8 | — |`. Di bagian **Deploy**, tambahkan butir:
  `- Database produksi = MariaDB Hostinger. Saat membuat DB di hPanel (Fase 4), cek `SELECT VERSION();` di phpMyAdmin hosting. Jika versi mayor berubah dari 11.8, samakan image CI (`mariadb:<versi>`) dan catat di DECISIONS. Koneksi app selalu memakai UTC, utf8mb4_unicode_ci, dan sql_mode ketat (CR-004).`
- Header `1.9` → `1.10` + riwayat:
  `| 1.10 | 23 Nov 2026 | CR-004: XAMPP diganti **MariaDB 11.8 standalone** (sama dengan Hostinger & CI); CI pindah dari MySQL 8.0 ke `mariadb:11.8`; koneksi DB mengatur sql_mode/UTC/collation sendiri; `scripts/db-setup.ps1`; HeidiSQL pengganti phpMyAdmin. Alur deploy tidak berubah. |`

### C2. CLAUDE.md
Ganti baris "Dev lokal (Windows): XAMPP **hanya** untuk MySQL/MariaDB ..." dengan:
```markdown
Dev lokal (Windows): **MariaDB 11.8** (service `MariaDB`, sama dengan Hostinger & CI) + PHP 8.4 (`PHP_BIN=C:\php-8.4\php.exe`). XAMPP **tidak dipakai**. Jalankan `npm run dev` (Vite :5173 + `php -S` :8000, proxy `/api`). Akses DB lewat client `mariadb` & Phinx, tanpa MCP database. Waktu disimpan UTC; migrasi wajib `utf8mb4_unicode_ci`. Detail PRD §17.1.
```

### C3. docs/PANDUAN_VIBE_CODING.md
- Diagram bagian 1: hapus kotak "Nyalakan MySQL (XAMPP)". Ganti teks di bawahnya menjadi "Database (MariaDB) menyala otomatis".
- Bagian 2 Persiapan: `- [x] XAMPP (MySQL)` → `- [x] MariaDB 11.8 (otomatis menyala bersama Windows)`.
- Bagian 3 Langkah 1 & Bagian 4A Langkah 1: hapus langkah "Start MySQL di XAMPP". Nomori ulang langkah lainnya.
- Bagian 6, baris **Database** → `Buka **HeidiSQL** (Start menu) → koneksi 127.0.0.1, user studykids. Atau minta Claude: "Tampilkan isi tabel settings."`
- Bagian 10 Troubleshooting, baris "tidak bisa konek database" → `Database belum jalan. Minta Claude: "Cek service MariaDB dan nyalakan kalau mati." Atau buka Services Windows → MariaDB → Start.` Tambahkan baris: `| XAMPP | Tidak dipakai lagi. Jangan Start MySQL di XAMPP karena akan bentrok dengan MariaDB di port 3306. |`

### C4. PROGRESS.md & rencana Fase 0
- B3 → `- [x] B3 (diganti CR-004) Database = MariaDB 11.8 service, menyala otomatis`.
- Tambahkan task: `- [ ] CR-004 `[sonnet]` Ganti XAMPP → MariaDB 11.8 (Bagian A–C) — sebelum T0.12`. Tag `[sonnet]` karena skemanya tidak berubah. B5 (perubahan koneksi DB) dikerjakan oleh `architect` sesuai aturan eskalasi.
- Exit Criteria E1/E2 Fase 0 dibuktikan ulang dengan MariaDB 11.8: CI hijau dengan `mariadb:11.8`, dan `npm run dev` → DB ok.
