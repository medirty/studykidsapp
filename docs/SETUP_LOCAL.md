# Setup Lokal StudyKids (Windows)

Panduan klik-demi-klik untuk menyiapkan laptop dev, misalnya laptop baru atau setelah instal ulang. Rujukan: PRD §17.1 (keputusan K9).

> **Cek cepat kapan saja:** `node scripts/doctor.mjs`
> Hasilnya ✓/✗ per item, dengan perintah perbaikan untuk setiap ✗. Exit code ≠ 0 berarti masih ada yang belum siap.
> Claude Code juga menjalankan `node scripts/doctor.mjs --quiet` otomatis di awal setiap sesi (hook di `.claude/settings.json`). Mode `--quiet` hanya mencetak item ✗.

## Ringkasan komponen

| Komponen | Versi / lokasi | Catatan |
|---|---|---|
| Node.js | ≥ 22.12 (LTS) | npm ikut terpasang |
| Git, GitHub CLI (`gh`) | terbaru | `gh` login sebagai `medirty` |
| Composer | ≥ 2.7 | |
| PHP | 8.4 NTS x64 di **`C:\php-8.4`** | Bukan PHP XAMPP. PATH sistem **tidak diubah**; project memanggil PHP lewat `PHP_BIN` |
| MariaDB | **11.8** (service Windows `MariaDB`, port 3306) | Sama dengan Hostinger & CI. XAMPP tidak dipakai (CR-004) |

---

## Langkah 1: Node, Git, GitHub CLI, Composer

Buka **PowerShell**, lalu jalankan perintah yang belum terpasang:

```powershell
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Git.Git -e
winget install --id GitHub.cli -e
winget install --id Composer.Composer -e
```

Tutup lalu buka lagi PowerShell, kemudian login GitHub:

```powershell
gh auth login      # pilih GitHub.com → HTTPS → Login with a web browser
```

## Langkah 2: PHP 8.4 (install bersih)

1. Buka <https://windows.php.net/download/> → bagian **PHP 8.4** → **VS17 x64 Non Thread Safe** → klik **Zip**.
2. Ekstrak isinya ke **`C:\php-8.4`**, sehingga ada file `C:\php-8.4\php.exe`.
   - Jangan pakai folder lama `C:\php-8.4.2`, karena berisi DLL PHP 8.2 yang menyebabkan error.
3. Di `C:\php-8.4`, salin `php.ini-development`, lalu ganti nama salinannya menjadi `php.ini`.
4. Buka `php.ini` dengan Notepad, lalu:
   - Cari `;extension_dir = "ext"` → ganti menjadi `extension_dir = "C:\php-8.4\ext"` (hapus `;` di depannya).
   - Hapus `;` di depan 8 baris ini:
     ```ini
     extension=curl
     extension=fileinfo
     extension=intl
     extension=mbstring
     extension=openssl
     extension=pdo_mysql
     extension=sodium
     extension=zip
     ```
5. Simpan. Cek di PowerShell:
   ```powershell
   C:\php-8.4\php.exe -v     # harus PHP 8.4.x, tanpa warning
   C:\php-8.4\php.exe -m     # 8 ekstensi di atas harus muncul
   ```

> **Kenapa PATH tidak diubah?** Perintah `php` di PATH tetap menunjuk PHP 8.2 milik XAMPP. Script project (npm, Composer) memakai `PHP_BIN=C:\php-8.4\php.exe` dari `backend/.env`, jadi tidak bentrok.

## Langkah 3: Install MariaDB 11.8 (MSI)

1. Pasang tanpa dialog installer. Buat password root acak (≥ 24 karakter) dan simpan di `%USERPROFILE%\.studykids\mariadb-root.txt` (di luar repo, akses hanya user Windows kamu), lalu:
   ```powershell
   winget install --id MariaDB.Server --version 11.8.2.0 -e --silent --accept-package-agreements --accept-source-agreements --override "/qn SERVICENAME=MariaDB PORT=3306 UTF8=1 PASSWORD=<password-root>"
   ```
   Cadangan: unduh MSI 11.8 LTS (Windows x86_64) dari <https://mariadb.org/download/> dan pasang dengan opsi `/qn` yang sama lewat `msiexec`. HeidiSQL ikut terpasang (untuk melihat data).
2. Cek: `Get-Service MariaDB` → `Running` + `Automatic` (menyala otomatis bersama Windows).
3. Tambahkan client ke PATH user (sekali saja; hapus `C:\xampp\mysql\bin` jika ada), lalu **restart Claude Desktop / terminal**:
   ```powershell
   [Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path","User") + ";C:\Program Files\MariaDB 11.8\bin", "User")
   ```
4. Jangan Start MySQL di XAMPP: akan bentrok di port 3306.

## Langkah 4: User & database (`scripts/db-setup.ps1`)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\db-setup.ps1
```

Script membaca password root dari file Langkah 3 (atau meminta jika file tidak ada), membuat `studykids_dev` & `studykids_test` (utf8mb4 / `utf8mb4_unicode_ci`), user `studykids` (hak hanya ke dua DB itu, password acak), lalu mengisi `backend/.env`. Aman dijalankan ulang. Tambah `-ResetPassword` untuk mengganti password user `studykids`. Aplikasi tidak pernah memakai `root`.

## Langkah 5: `backend/.env`

Buat file `backend/.env`. File ini **di-ignore Git, jangan pernah di-commit**. Setelah Langkah 4, file ini terisi otomatis (kalau belum ada, salin dari `backend/.env.example`). Isi minimal:

```ini
PHP_BIN=C:\php-8.4\php.exe
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=studykids_dev
DB_TEST_NAME=studykids_test
DB_USER=studykids
DB_PASS=<diisi otomatis oleh db-setup.ps1>
```

`DB_PORT` dan `DB_TEST_NAME` boleh dikosongkan. Default-nya `3306` dan `studykids_test`.

## Langkah 6: Cek semuanya

```powershell
cd C:\Users\Lenovo\Documents\Work\studykidsapp
node scripts/doctor.mjs
```

Contoh hasil:

```
StudyKids doctor
✓ Node.js — v22.12.0 (min 22.12)
✓ PHP 8.4 (PHP_BIN) — v8.4.28 di C:\php-8.4\php.exe
✓ Ekstensi PHP wajib — 8/8 aktif
✗ Folder bin MariaDB di PATH — belum aktif di sesi ini
    perbaiki: sudah ada di PATH user — restart Claude Desktop / terminal agar aktif
...
18/19 OK
```

Perbaiki setiap ✗ sesuai baris `perbaiki:`, lalu jalankan lagi sampai semua ✓.

### Yang dicek `doctor`

| Kelompok | Item |
|---|---|
| Software | Node ≥ 22.12, Git, GitHub CLI + login, Composer ≥ 2.7, PHP 8.4 di `PHP_BIN`, 8 ekstensi PHP |
| Database | `backend/.env` lengkap, client MariaDB, folder bin di PATH, service `MariaDB` Running + Automatic, server 11.8.x di :3306, login `studykids` ke DB dev & test |
| Port | 5173 (Vite) dan 8000 (API PHP) bebas. Jika `npm run dev` sedang jalan, ✗ di sini wajar |
| Claude Code | plugin superpowers + frontend-design aktif, tanpa claude-mem, skill find-skills, MCP playwright/context7/chrome-devtools terdaftar (lihat `docs/setup/BOOTSTRAP.md`) |

## Masalah umum

| Gejala | Solusi |
|---|---|
| `PHP Warning: Unable to load dynamic library` | `extension_dir` di `php.ini` salah, atau DLL dari versi PHP lain. Pakai folder `C:\php-8.4` yang bersih |
| `Login MariaDB → DB dev ✗` + `Can't connect` | Service MariaDB mati: Services Windows → MariaDB → Start (atau minta Claude menyalakannya) |
| `Access denied for user 'studykids'` | Jalankan ulang `scripts/db-setup.ps1 -ResetPassword` |
| `Port 3306` dipakai program lain | Biasanya MySQL XAMPP masih jalan: hentikan. XAMPP tidak dipakai lagi |
| `mariadb` tidak dikenal di terminal | Langkah 3 poin 3, lalu restart terminal (script project tidak bergantung pada PATH) |

> **Alternatif (tidak wajib):** Laragon. Docker tidak dipakai di project ini.
