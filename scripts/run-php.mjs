// Run PHP with PHP_BIN from backend/.env (local PHP 8.4), forwarding args and exit code (D-002).
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolvePhpBin } from './lib/php-bin.mjs';

const envFile = new URL('../backend/.env', import.meta.url);
const php = resolvePhpBin(existsSync(envFile) ? readFileSync(envFile, 'utf8') : null);
const result = spawnSync(php, process.argv.slice(2), { stdio: 'inherit' });

if (result.error) {
  process.stderr.write(`run-php: cannot start "${php}": ${result.error.message}\n`);
  process.exit(1);
}
process.exit(result.status ?? 1);
