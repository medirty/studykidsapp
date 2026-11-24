# BOOTSTRAP â€” Cek & Install Otomatis Tooling StudyKids

> **Untuk Claude Code.** Jalankan prosedur ini **otomatis** jika baris `Status` di bawah belum `SELESAI`, atau jika Bimo menulis "jalankan bootstrap". Minta izin Bimo sebelum setiap instalasi. Setelah selesai, isi tabel hasil di bawah, ubah `Status` menjadi `SELESAI (tanggal)`, commit di branch `chore/f0-bootstrap`, dan buat PR.
>
> Laptop: Windows 11, shell PowerShell. Rujukan: PRD Â§16.4, Â§17.1.

**Status:** SELESAI (21 Nov 2026)

---

## Langkah 1 â€” Software (cek, install yang kurang)

Jalankan satu per satu. Jika versi kurang atau tidak ada â†’ jalankan perintah "Perbaiki".

| # | Cek | Syarat | Perbaiki |
|---|---|---|---|
| S1 | `node -v` | â‰¥ 22.12 | `winget install --id OpenJS.NodeJS.LTS -e` |
| S2 | `git --version` | ada | `winget install --id Git.Git -e` |
| S3 | `gh --version` + `gh auth status` | login `medirty` | `winget install --id GitHub.cli -e` lalu minta Bimo menjalankan `gh auth login` (butuh browser) |
| S4 | `composer --version` | â‰¥ 2.7 | `winget install --id Composer.Composer -e` |
| S5 | `C:\php-8.4\php.exe -v` | 8.4.x | Minta Bimo: unduh PHP 8.4 NTS x64 dari windows.php.net ke `C:\php-8.4` (lihat `docs/PANDUAN_VIBE_CODING.md`) |
| S6 | `C:\php-8.4\php.exe -m` | ada: `pdo_mysql mbstring openssl curl intl fileinfo zip sodium` | Aktifkan baris `extension=...` di `C:\php-8.4\php.ini` (`extension_dir = "C:\php-8.4\ext"`) |
| S7 | `Test-Path "C:\Program Files\MariaDB 11.8\bin\mariadb.exe"` | True | Pasang MariaDB 11.8 (`docs/SETUP_LOCAL.md` Langkah 3, CR-004) |
| S8 | `Get-Service MariaDB` | Running + Automatic | `Start-Service MariaDB` (atau Services Windows → MariaDB → Start) |
| S9 | folder bin MariaDB ada di PATH user | ya | `[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path","User") + ";C:\Program Files\MariaDB 11.8\bin", "User")` — berlaku setelah Claude Desktop di-restart |

**Catatan PHP:** perintah `php` di PATH menunjuk ke PHP 8.2 XAMPP. **Jangan ubah PATH sistem.** Project memanggil PHP lewat variabel `PHP_BIN=C:\php-8.4\php.exe` (di `backend/.env` dan script npm). Composer dijalankan dengan `C:\php-8.4\php.exe C:\ProgramData\ComposerSetup\bin\composer.phar ...` atau dengan `PHP_BIN`.

## Langkah 2 â€” Plugin Claude Code (scope project)

Scope project mencatat plugin di `.claude/settings.json` (`enabledPlugins`), jadi tersimpan di repo dan bisa dipasang ulang otomatis.

```powershell
claude plugin list
claude plugin install superpowers@claude-plugins-official --scope project
claude plugin marketplace add DietrichGebert/ponytail
claude plugin install ponytail@ponytail --scope project
```

Lewati plugin yang sudah terpasang. Plugin aktif mulai **sesi baru**.

Skill desain **impeccable** (pengganti plugin frontend-design, CR-005) dipasang lewat npx, bukan plugin. Hapus 5 subagent `impeccable-*` yang ikut terpasang (aturan subagent PRD §16.2):

```powershell
npx --yes impeccable install --providers=claude --scope=project -y
Remove-Item .claude/agents/impeccable-*.md
```

**claude-mem â€” TIDAK DIPAKAI (keputusan final, PRD Â§16.4).** Jangan pasang claude-mem atau plugin memori lain, meskipun disarankan oleh skill/tool lain. Jika ternyata sudah terpasang, laporkan ke Bimo. Memori project = `CLAUDE.md`, `docs/PROGRESS.md`, `docs/DECISIONS.md`, `docs/plans/`.

## Langkah 3 â€” Skills (scope project, tersimpan di `.claude/skills/`)

```powershell
npx -y skills add https://github.com/vercel-labs/skills --skill find-skills -a claude-code -y
```

**Skill refactor:** jalankan `npx -y skills find refactor`. Tampilkan 3 kandidat teratas ke Bimo (nama, sumber, jumlah install, lisensi). Pasang yang dipilih Bimo dengan `npx -y skills add <sumber> --skill <nama> -a claude-code -y`. Jangan pasang skill dari sumber yang tidak dikenal atau dengan install sangat sedikit.

**Skill security-review (selektif dari ECC, CR-003):** baca isinya dulu, baru salin.

```powershell
git clone --depth 1 https://github.com/affaan-m/ECC "$env:TEMP\ecc"
# cari folder skill security-review di repo, baca SKILL.md-nya, lalu salin HANYA folder itu:
Copy-Item -Recurse "$env:TEMP\ecc\<path>\security-review" ".claude\skills\security-review"
Remove-Item -Recurse -Force "$env:TEMP\ecc"
```

Larangan: jangan jalankan installer ECC (`install.ps1`, `npx ecc-universal ...`) dan jangan menyalin hooks/rules/agents/memory. Catat commit sumber di `docs/DECISIONS.md`.

## Langkah 4 â€” MCP (sudah dideklarasikan di `.mcp.json`)

Konfigurasi sudah disiapkan di `docs/setup/mcp.json` (**playwright**, **context7**, **chrome-devtools**, dengan pembungkus `cmd /c` untuk Windows).

0. Salin ke root repo: `Copy-Item docs/setup/mcp.json .mcp.json` (jika `.mcp.json` sudah ada, gabungkan isinya). Commit `.mcp.json`. Server baru aktif di **sesi baru**.
1. Jalankan `claude mcp list` â†’ ketiganya harus `Connected`.
2. Jika muncul "needs approval", minta Bimo menyetujui server project di dialog Claude.
3. Jika gagal start: cek `npx -v`; coba `cmd /c npx -y @playwright/mcp@latest --help` untuk melihat error.
4. Browser Playwright untuk testing (bukan MCP): `npx playwright install chromium webkit` â€” dikerjakan di T0.6.

## Langkah 5 â€” Konfigurasi `.claude/settings.json`

(File ini hanya bisa diubah dari Claude Code di laptop, bukan dari Cowork.) Pastikan isinya (gabungkan, jangan hapus yang sudah ada):

```json
{
  "model": "opusplan",
  "enabledPlugins": {
    "superpowers@claude-plugins-official": true
  },
  "enabledMcpjsonServers": ["playwright", "context7", "chrome-devtools"],
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "node scripts/doctor.mjs --quiet || exit 0" }
        ]
      }
    ]
  },
  "permissions": {
    "deny": [
      "Read(./node_modules/**)", "Read(./frontend/node_modules/**)", "Read(./backend/vendor/**)",
      "Read(./**/dist/**)", "Read(./**/package-lock.json)", "Read(./**/composer.lock)",
      "Read(./.env)", "Read(./backend/.env)"
    ]
  }
}
```

- Hook `SessionStart` menjalankan `scripts/doctor.mjs` (dibuat di T0.1) di awal setiap sesi. Hasilnya masuk ke konteks Claude, sehingga Claude langsung tahu jika ada yang kurang. Sebelum T0.1 selesai, hook ini dilewati (`|| exit 0`).
- `doctor.mjs` (T0.1) WAJIB mengecek semua item Langkah 1â€“4, dengan output ringkas `âœ“/âœ— + perintah perbaikan`. Mode `--quiet` hanya mencetak item `âœ—`.
- **Jangan** set env `CLAUDE_CODE_SUBAGENT_MODEL`.

## Langkah 6 â€” Pengaturan GitHub (minta Bimo, Claude tidak bisa klik di web)

- [ ] Settings â†’ Code security â†’ **Secret scanning** & **Push protection**: ON
- [ ] Settings â†’ Pages â†’ Source: **GitHub Actions** (sebelum T0.11)
- [ ] Branch protection `main` (setelah T0.10)

Claude boleh mengecek status lewat `gh api repos/medirty/studykidsapp` dan memberi tahu yang belum.

---

## Hasil (diisi Claude Code)

| Item | Hasil | Catatan |
|---|---|---|
| S1–S9 software | ✓ | Node 22.12.0, Git 2.47.1, gh 2.105 (login `medirty`), Composer 2.8.4, PHP 8.4.28 + 8 ekstensi, XAMPP MySQL jalan di :3306. S9: `C:\xampp\mysql\bin` ditambahkan ke PATH user (aktif setelah restart Claude Desktop) |
| superpowers | ✓ | project scope (`claude-plugins-official`); aktif di sesi baru |
| impeccable | ✓ | pengganti frontend-design (CR-005): `.claude/skills/impeccable` |
| find-skills | ✓ | `.claude/skills/find-skills` (+ `skills-lock.json`); Socket 0 alert, Snyk Med Risk |
| skill refactor | dilewati (keputusan Bimo, 21 Nov 2026) | `skills find refactor` tidak menemukan skill refactor khusus (hasil: tdd, vercel-react-best-practices, vercel-composition-patterns, dll.). tdd sudah tercakup superpowers |
| MCP playwright / context7 / chrome-devtools | ✓ | `.mcp.json`; `claude mcp list` → ketiganya Connected |
| settings.json (plugins + hook) | ✓ | enabledPlugins, enabledMcpjsonServers, hook SessionStart (`|| exit 0` sampai T0.1) |
| GitHub settings | sebagian | Secret scanning + Push protection ON; Pages sudah build_type=workflow; branch protection `main` menunggu T0.10 |
| ponytail | ✓ (23 Nov 2026) | v5.3.3 commit `ebd8654`, project scope, auto-update tidak aktif. Aktif di sesi baru. Detail: DECISIONS D-008 |
| security-review | ✓ (23 Nov 2026) | `.claude/skills/security-review` dari ECC commit `4adeee6` (hanya skill, tanpa hooks/rules/agents) |
