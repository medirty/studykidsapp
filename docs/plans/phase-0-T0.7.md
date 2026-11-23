# T0.7 — Scaffold backend Slim 4 + PDO + `/api/health` (rencana)

PRD §10.1, §11 (backend/), §8.3. Acuan: D-002 (script), D-003 (env), D-004 (PHP 8.2 compat), D-006 (dependency).

## Desain (paling sederhana yang memenuhi AC)

- `backend/composer.json`: hanya paket D-006 untuk T0.7 (slim, slim/psr7, php-di, phpdotenv; dev: phpunit ^11.5, phpstan ^2.3, php-cs-fixer ^3.95). `config.platform.php = 8.2.0`. Autoload PSR-4 `StudyKids\` → `src/`, `StudyKids\Tests\` → `tests/`.
- `src/Support/Database.php`: simpan config, buka PDO **lazy** saat `pdo()` dipanggil (agar health bisa menangkap kegagalan koneksi). DSN `mysql:...;charset=utf8mb4`, `ERRMODE_EXCEPTION`, `EMULATE_PREPARES=false`, `FETCH_ASSOC`. `Database::fromEnv()` membaca `DB_*` (`$_ENV` + `getenv()` agar env CI juga terbaca).
- `src/Support/AppFactory.php`: buat container PHP-DI berisi `Database`, Slim App, routing, body parsing, error middleware (`displayErrorDetails=false`, paksa JSON).
- `src/Routes/api.php`: grup `/api` → `GET /api/health` → `HealthController`.
- `src/Controllers/HealthController.php`: `SELECT 1` lewat prepared statement. DB ok → 200 `{"status":"ok","db":"ok"}`. DB gagal → 503 `{"status":"ok","db":"error"}` (`status` = API hidup; kode 503 agar monitor tahu ada masalah). Pesan error PDO tidak pernah dikirim.
- `public/index.php`: autoload → load `.env` (safeLoad) → `AppFactory::create(Database::fromEnv())->run()`.
- Test (PHPUnit, tanpa HTTP server): health dengan DB (`DB_TEST_NAME`, butuh MySQL), health tanpa DB (stub `Database` yang melempar `PDOException` berisi "rahasia" → tidak bocor), 404 JSON, 500 JSON tanpa detail.
- Tooling: PHPStan level 6 (`src`, `tests`, `public`), PHP-CS-Fixer `@PER-CS`. Composer scripts `test`, `lint`, `fix` (D-002).
- Root: `scripts/run-php.mjs` + `scripts/lib/php-bin.mjs` (`resolvePhpBin`, test `node --test`), script `test:api` & `lint:api` (D-002).
- `backend/.env.example`: tambah `APP_ENV` (D-003).

## Di luar scope
Phinx/skema (T0.8), `npm run dev` (T0.9), CI (T0.10), header keamanan/CSRF/rate limit (belum ada endpoint yang mengubah data; Fase 4).
