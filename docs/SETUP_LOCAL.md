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
| MySQL/MariaDB | dari **XAMPP** (`C:\xampp`) | Hanya MySQL. Apache/`htdocs` tidak dipakai (kecuali sebentar untuk phpMyAdmin) |

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

## Langkah 3: XAMPP (MySQL)

1. Jika belum ada: unduh XAMPP dari <https://www.apachefriends.org/> → install ke **`C:\xampp`** (komponen cukup **MySQL** + **phpMyAdmin**).
2. Buka **XAMPP Control Panel** → **Start** pada baris **MySQL**. Lakukan ini setiap mulai kerja.
3. Tambahkan client `mysql` ke PATH user (sekali saja):
   ```powershell
   [Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path","User") + ";C:\xampp\mysql\bin", "User")
   ```
   Lalu **restart Claude Desktop / terminal** supaya PATH baru terbaca.

## Langkah 4: User & database MySQL

Masuk sebagai root. Password root XAMPP default kosong, jadi tekan Enter saja:

```powershell
C:\xampp\mysql\bin\mysql.exe -u root -p
```

Jalankan perintah berikut, ganti `GANTI_PASSWORD_KUAT` dengan password buatanmu sendiri:

```sql
CREATE DATABASE studykids_dev  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE studykids_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'studykids'@'localhost' IDENTIFIED BY 'GANTI_PASSWORD_KUAT';
CREATE USER 'studykids'@'127.0.0.1' IDENTIFIED BY 'GANTI_PASSWORD_KUAT';
GRANT ALL PRIVILEGES ON studykids_dev.*  TO 'studykids'@'localhost', 'studykids'@'127.0.0.1';
GRANT ALL PRIVILEGES ON studykids_test.* TO 'studykids'@'localhost', 'studykids'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

User `studykids` hanya punya hak ke dua DB ini. Aplikasi tidak pernah memakai `root`.

## Langkah 5: `backend/.env`

Buat file `backend/.env`. File ini **di-ignore Git, jangan pernah di-commit**. Setelah T0.2 selesai, cukup salin dari `backend/.env.example`. Isi minimal:

```ini
PHP_BIN=C:\php-8.4\php.exe
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=studykids_dev
DB_TEST_NAME=studykids_test
DB_USER=studykids
DB_PASS=GANTI_PASSWORD_KUAT
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
✗ `mysql` di PATH — belum aktif di sesi ini
    perbaiki: sudah ada di PATH user — restart Claude Desktop / terminal agar aktif
...
18/19 OK
```

Perbaiki setiap ✗ sesuai baris `perbaiki:`, lalu jalankan lagi sampai semua ✓.

### Yang dicek `doctor`

| Kelompok | Item |
|---|---|
| Software | Node ≥ 22.12, Git, GitHub CLI + login, Composer ≥ 2.7, PHP 8.4 di `PHP_BIN`, 8 ekstensi PHP |
| Database | `backend/.env` lengkap, `mysql.exe` XAMPP, `mysql` di PATH, MySQL jalan di :3306, login `studykids` ke DB dev & test |
| Port | 5173 (Vite) dan 8000 (API PHP) bebas. Jika `npm run dev` sedang jalan, ✗ di sini wajar |
| Claude Code | plugin superpowers + frontend-design aktif, tanpa claude-mem, skill find-skills, MCP playwright/context7/chrome-devtools terdaftar (lihat `docs/setup/BOOTSTRAP.md`) |

## Masalah umum

| Gejala | Solusi |
|---|---|
| `PHP Warning: Unable to load dynamic library` | `extension_dir` di `php.ini` salah, atau DLL dari versi PHP lain. Pakai folder `C:\php-8.4` yang bersih |
| `Login MySQL → DB dev ✗` + `Can't connect` | MySQL belum di-Start di XAMPP |
| `Access denied for user 'studykids'` | Password di `backend/.env` beda dengan Langkah 4, atau user belum dibuat untuk host `127.0.0.1` |
| `Port 3306` dipakai program lain | Matikan service MySQL lain (Services → MySQL*), atau ubah `DB_PORT` |
| `mysql` tidak dikenal di terminal | Langkah 3 poin 3, lalu restart terminal |

> **Alternatif (tidak wajib):** Laragon. Docker tidak dipakai di project ini.
