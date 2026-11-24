// Pure helpers for scripts/doctor.mjs (no I/O, unit-tested with `node --test`).

export const REQUIRED_PHP_EXTENSIONS = [
  'pdo_mysql',
  'mbstring',
  'openssl',
  'curl',
  'intl',
  'fileinfo',
  'zip',
  'sodium',
];

export const REQUIRED_ENV_KEYS = ['PHP_BIN', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS'];

export const REQUIRED_PLUGINS = [
  'superpowers@claude-plugins-official',
  'ponytail@ponytail',
];

export const REQUIRED_MCP_SERVERS = ['playwright', 'context7', 'chrome-devtools'];

/** Parse KEY=VALUE lines of a .env file. Ignores comments and blank lines. */
export function parseEnv(text) {
  const env = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    env[key] = stripQuotes(line.slice(eq + 1).trim());
  }
  return env;
}

function stripQuotes(value) {
  const quoted = /^(['"]).*\1$/.test(value);
  return quoted ? value.slice(1, -1) : value;
}

/** First "x.y.z" (or "x.y") found in text, or null. */
export function extractVersion(text) {
  const match = /(\d+)\.(\d+)(?:\.(\d+))?/.exec(text ?? '');
  return match ? match.slice(1).map((n) => Number(n ?? 0)).join('.') : null;
}

/** True when version >= minimum (numeric, dot-separated). */
export function versionAtLeast(version, minimum) {
  if (!version) return false;
  const a = version.split('.').map(Number);
  const b = minimum.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return true;
}

/** Required PHP extensions missing from `php -m` output. */
export function missingPhpExtensions(phpModulesOutput) {
  const loaded = new Set(
    phpModulesOutput.split(/\r?\n/).map((l) => l.trim().toLowerCase()),
  );
  return REQUIRED_PHP_EXTENSIONS.filter((ext) => !loaded.has(ext));
}

/** Keys from `required` that are absent or empty in env. */
export function missingKeys(env, required) {
  return required.filter((key) => !env[key]);
}

/** True when a ";"-separated PATH string contains dir (case/slash-insensitive). */
export function pathContains(pathValue, dir) {
  const norm = (p) => p.trim().replace(/[\\/]+$/, '').replace(/\//g, '\\').toLowerCase();
  return (pathValue ?? '').split(';').some((p) => norm(p) === norm(dir));
}

/** First existing DB client: DB_CLIENT_BIN → default MariaDB path; null → caller falls back to PATH. */
export function pickDbClient(candidates, exists) {
  return candidates.find((c) => c && exists(c)) ?? null;
}

/** True when a `SELECT VERSION()` / `--version` text is MariaDB 11.8.x (CR-004). */
export function isMariaDb118(text) {
  return /\b11\.8\.\d+/.test(text ?? '');
}

/** Format results; quiet mode keeps only failures. */
export function formatResults(results, { quiet = false } = {}) {
  const lines = [];
  for (const r of results) {
    if (r.ok && quiet) continue;
    lines.push(`${r.ok ? '✓' : '✗'} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
    if (!r.ok && r.fix) lines.push(`    perbaiki: ${r.fix}`);
  }
  return lines;
}
