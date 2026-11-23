import { parseEnv } from './doctor-utils.mjs';

/** PHP binary from backend/.env text (PHP_BIN), or `php` when unset (CI/server). */
export function resolvePhpBin(envText) {
  return parseEnv(envText ?? '').PHP_BIN?.trim() || 'php';
}
