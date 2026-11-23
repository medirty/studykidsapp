// npm run db:reset [-- --test]: rollback all + migrate + seed, only on safe targets (D-002, D-003).
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseEnv } from './lib/doctor-utils.mjs';
import { resolvePhpBin } from './lib/php-bin.mjs';
import { resetTarget } from './lib/db-guard.mjs';

const envFile = new URL('../backend/.env', import.meta.url);
const fileText = existsSync(envFile) ? readFileSync(envFile, 'utf8') : '';
// Same precedence as phpdotenv createImmutable: real environment wins over backend/.env.
const env = { ...parseEnv(fileText), ...process.env };
const target = resetTarget(env, { test: process.argv.includes('--test') });

if (target.error) {
  process.stderr.write(`db:reset DITOLAK: ${target.error}\n`);
  process.exit(1);
}

// Pass the checked values explicitly so Phinx uses exactly what the guard approved.
const childEnv = { ...process.env, APP_ENV: env.APP_ENV, [target.dbVar]: target.db };
const php = resolvePhpBin(fileText);
const phinx = ['backend/vendor/bin/phinx', '-c', 'backend/phinx.php', '-e', target.phinxEnv];
const steps = [['rollback', '-t', '0'], ['migrate'], ['seed:run']];

process.stdout.write(`db:reset → ${target.db} (${target.phinxEnv})\n`);
for (const [command, ...args] of steps) {
  const run = spawnSync(php, [phinx[0], command, ...phinx.slice(1), ...args], {
    stdio: 'inherit',
    env: childEnv,
  });
  if (run.error || run.status !== 0) {
    process.stderr.write(`db:reset gagal di langkah "${command}".\n`);
    process.exit(1);
  }
}
process.stdout.write(`db:reset selesai: ${target.db}\n`);
