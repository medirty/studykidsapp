# Menyiapkan DB lokal MariaDB 11.8 (CR-004): DB dev & test, user `studykids`, lalu isi backend/.env.
# Aman dijalankan ulang. Pakai -ResetPassword untuk mengganti password user studykids.
param([switch]$ResetPassword)
$ErrorActionPreference = 'Stop'

$root = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $root 'backend\.env'
$rootPwFile = Join-Path $env:USERPROFILE '.studykids\mariadb-root.txt'

$client = @($env:DB_CLIENT_BIN, 'C:\Program Files\MariaDB 11.8\bin\mariadb.exe') |
  Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $client) { $client = (Get-Command mariadb, mysql -ErrorAction SilentlyContinue | Select-Object -First 1).Source }
if (-not $client) { throw 'Client mariadb tidak ditemukan. Pasang MariaDB 11.8 (docs/SETUP_LOCAL.md).' }

if (Test-Path $rootPwFile) {
  $rootPw = (Get-Content $rootPwFile -Raw).Trim()
} else {
  $sec = Read-Host 'Password root MariaDB' -AsSecureString
  $rootPw = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}

function Get-EnvValue($name) {
  if (-not (Test-Path $envFile)) { return '' }
  $m = Select-String -Path $envFile -Pattern "^$name=(.*)$" | Select-Object -First 1
  if ($m) { $m.Matches[0].Groups[1].Value.Trim() } else { '' }
}

function New-RandomPassword {
  $chars = [char[]]'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  -join (1..32 | ForEach-Object { $chars | Get-Random })
}

$userPw = Get-EnvValue 'DB_PASS'
if ($ResetPassword -or -not $userPw) { $userPw = New-RandomPassword }

# Password hanya berisi huruf/angka, jadi aman dimasukkan ke literal SQL.
$sql = @"
CREATE DATABASE IF NOT EXISTS studykids_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS studykids_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'studykids'@'localhost' IDENTIFIED BY '$userPw';
ALTER USER 'studykids'@'localhost' IDENTIFIED BY '$userPw';
GRANT ALL PRIVILEGES ON studykids_dev.* TO 'studykids'@'localhost';
GRANT ALL PRIVILEGES ON studykids_test.* TO 'studykids'@'localhost';
FLUSH PRIVILEGES;
"@

$env:MYSQL_PWD = $rootPw
try {
  $sql | & $client -u root -h 127.0.0.1 -P 3306
  if ($LASTEXITCODE -ne 0) { throw "Perintah SQL gagal (exit $LASTEXITCODE). Cek service MariaDB & password root." }
} finally { Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue }

# Tulis ke backend/.env tanpa menghapus isi lain.
if (-not (Test-Path $envFile)) { Copy-Item (Join-Path $root 'backend\.env.example') $envFile }
$lines = Get-Content $envFile
$values = [ordered]@{ DB_HOST = '127.0.0.1'; DB_PORT = '3306'; DB_USER = 'studykids'; DB_PASS = $userPw }
foreach ($k in $values.Keys) {
  $line = "$k=$($values[$k])"
  if ($lines -match "^$k=") { $lines = $lines -replace "^$k=.*$", $line } else { $lines += $line }
}
Set-Content -Path $envFile -Value $lines -Encoding ascii
Write-Host 'OK: DB studykids_dev & studykids_test siap, backend/.env diperbarui.'
