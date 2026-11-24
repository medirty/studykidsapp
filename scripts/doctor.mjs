#!/usr/bin/env node
// StudyKids local environment check (PRD §17.1, docs/setup/BOOTSTRAP.md steps 1–4).
// Usage: node scripts/doctor.mjs [--quiet]   — exit code 1 when any item fails.
// No dependencies: Node built-ins only.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import net from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  REQUIRED_ENV_KEYS,
  REQUIRED_MCP_SERVERS,
  REQUIRED_PLUGINS,
  extractVersion,
  formatResults,
  isMariaDb118,
  missingKeys,
  missingPhpExtensions,
  parseEnv,
  pathContains,
  pickDbClient,
  versionAtLeast,
} from './lib/doctor-utils.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BACKEND_ENV = join(ROOT, 'backend', '.env');
const DEFAULT_PHP_BIN = 'C:\\php-8.4\\php.exe';
const DB_BIN_DIR = 'C:\\Program Files\\MariaDB 11.8\\bin';
const DB_SETUP_FIX = 'lihat docs/SETUP_LOCAL.md (MariaDB 11.8 + scripts/db-setup.ps1)';
const DEFAULT_TEST_DB = 'studykids_test';

function run(cmd, args = [], env = {}) {
  const res = spawnSync(cmd, args, {
    encoding: 'utf8',
    shell: true,
    timeout: 15000,
    windowsHide: true,
    env: { ...process.env, ...env },
  });
  const out = `${res.stdout ?? ''}${res.stderr ?? ''}`.trim();
  return { ok: res.status === 0, out };
}

const quote = (p) => `"${p}"`;
const result = (name, ok, detail, fix) => ({ name, ok, detail, fix });

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    return null;
  }
}

function loadBackendEnv() {
  return existsSync(BACKEND_ENV) ? parseEnv(readFileSync(BACKEND_ENV, 'utf8')) : null;
}

// ---------- software ----------

function checkVersion(name, cmd, minimum, fix) {
  const { ok, out } = run(cmd, ['--version']);
  const version = ok ? extractVersion(out) : null;
  const pass = versionAtLeast(version, minimum);
  const detail = version ? `v${version} (min ${minimum})` : 'tidak ditemukan';
  return result(name, pass, detail, fix);
}

function checkGhAuth() {
  const { ok } = run('gh', ['auth', 'status']);
  return result('GitHub CLI login', ok, ok ? 'login aktif' : 'belum login', 'jalankan `gh auth login` (butuh browser)');
}

function checkPhp(phpBin) {
  const fix = `unduh PHP 8.4 NTS x64 dari windows.php.net ke C:\\php-8.4, lalu set PHP_BIN di backend/.env (lihat docs/SETUP_LOCAL.md)`;
  if (!existsSync(phpBin)) return result('PHP 8.4 (PHP_BIN)', false, `${phpBin} tidak ada`, fix);
  const version = extractVersion(run(quote(phpBin), ['-v']).out);
  return result('PHP 8.4 (PHP_BIN)', versionAtLeast(version, '8.4'), `v${version} di ${phpBin}`, fix);
}

function checkPhpExtensions(phpBin) {
  if (!existsSync(phpBin)) return result('Ekstensi PHP', false, 'PHP_BIN tidak ada', 'perbaiki PHP dulu');
  const missing = missingPhpExtensions(run(quote(phpBin), ['-m']).out);
  const fix = `aktifkan di php.ini: ${missing.map((e) => `extension=${e}`).join(', ')}`;
  return result('Ekstensi PHP wajib', missing.length === 0, missing.length ? `kurang: ${missing.join(', ')}` : '8/8 aktif', fix);
}

// ---------- MariaDB (CR-004) ----------

// Order: DB_CLIENT_BIN → default MariaDB 11.8 path → `mariadb`/`mysql` on PATH.
function findDbClient(env) {
  const found = pickDbClient([env?.DB_CLIENT_BIN, join(DB_BIN_DIR, 'mariadb.exe')], existsSync);
  if (found) return quote(found);
  return ['mariadb', 'mysql'].find((c) => run(c, ['--version']).ok) ?? null;
}

function checkDbClient(client) {
  return result('Client MariaDB', Boolean(client), client ?? 'tidak ada', DB_SETUP_FIX);
}

function checkDbService() {
  const { out } = run('powershell', ['-NoProfile', '-Command', '"(Get-Service MariaDB).Status, (Get-Service MariaDB).StartType -join \' \'"']);
  const ok = out === 'Running Automatic';
  return result('Service MariaDB', ok, out || 'tidak ada', 'minta Claude: "Cek service MariaDB dan nyalakan kalau mati" (atau Services Windows → MariaDB → Start/Automatic)');
}

function userPathFromRegistry() {
  const { out } = run('reg', ['query', 'HKCU\\Environment', '/v', 'Path']);
  return /REG_(?:EXPAND_)?SZ\s+(.*)$/m.exec(out)?.[1] ?? '';
}

function checkDbInPath() {
  if (pathContains(process.env.PATH, DB_BIN_DIR)) return result('Folder bin MariaDB di PATH', true, 'ya');
  const inRegistry = pathContains(userPathFromRegistry(), DB_BIN_DIR);
  const fix = inRegistry
    ? 'sudah ada di PATH user — restart Claude Desktop / terminal agar aktif'
    : `[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path","User") + ";${DB_BIN_DIR}", "User")`;
  return result('Folder bin MariaDB di PATH', false, inRegistry ? 'belum aktif di sesi ini' : 'tidak ada', fix);
}

function checkDbLogin(client, env, dbName, label) {
  const name = `Login MariaDB → ${label}`;
  if (!env) return result(name, false, 'backend/.env tidak ada', 'buat backend/.env (lihat docs/SETUP_LOCAL.md)');
  if (!client) return result(name, false, 'client MariaDB tidak ada', DB_SETUP_FIX);
  const args = ['-h', env.DB_HOST, '-P', env.DB_PORT || '3306', '-u', env.DB_USER, '-N', '-B', '-e', quote('SELECT VERSION()'), dbName];
  const { ok, out } = run(client, args, { MYSQL_PWD: env.DB_PASS ?? '' });
  const detail = ok ? `${env.DB_USER}@${dbName}` : (out.split(/\r?\n/).pop() || 'gagal');
  return result(name, ok, detail, `jalankan scripts/db-setup.ps1; ${DB_SETUP_FIX}`);
}

function checkDbVersion(client, env) {
  const args = ['-h', env?.DB_HOST, '-P', env?.DB_PORT || '3306', '-u', env?.DB_USER, '-N', '-B', '-e', quote('SELECT VERSION()')];
  const { out } = client && env ? run(client, args, { MYSQL_PWD: env.DB_PASS ?? '' }) : { out: '' };
  const version = out.split(/\r?\n/).find((l) => /^\d+\./.test(l));
  return result('Versi server MariaDB 11.8.x', isMariaDb118(version), version || 'tidak terbaca', DB_SETUP_FIX);
}

// ---------- ports ----------

function portFree(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, host);
  });
}

function portOpen(port, host) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host, timeout: 1500 });
    const done = (ok) => { socket.destroy(); resolve(ok); };
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    socket.once('timeout', () => done(false));
  });
}

async function checkDbPort() {
  const ok = await portOpen(3306, '127.0.0.1');
  return result('MariaDB server :3306', ok, ok ? 'jalan' : 'tidak jalan', 'nyalakan service MariaDB (XAMPP MySQL tidak dipakai, jangan di-start)');
}

async function checkPortFree(port, label) {
  const ok = await portFree(port, '127.0.0.1');
  const fix = `port ${port} dipakai — jika \`npm run dev\` sudah jalan, abaikan; jika bukan, cari prosesnya: netstat -ano | findstr :${port}`;
  return result(`Port ${port} bebas (${label})`, ok, ok ? 'bebas' : 'dipakai', fix);
}

// ---------- config ----------

function checkBackendEnv(env) {
  if (!env) return result('backend/.env', false, 'tidak ada', 'salin backend/.env.example → backend/.env lalu isi (docs/SETUP_LOCAL.md langkah 5)');
  const missing = missingKeys(env, REQUIRED_ENV_KEYS);
  return result('backend/.env', missing.length === 0, missing.length ? `kunci kosong: ${missing.join(', ')}` : 'lengkap', `isi ${missing.join(', ')} di backend/.env`);
}

// ---------- Claude Code tooling ----------

function checkPlugins(settings) {
  const enabled = settings?.enabledPlugins ?? {};
  const missing = REQUIRED_PLUGINS.filter((p) => enabled[p] !== true);
  const fix = missing.map((p) => `claude plugin install ${p} --scope project`).join(' ; ');
  return result('Plugin Claude (superpowers, ponytail)', missing.length === 0, missing.length ? `kurang: ${missing.join(', ')}` : 'aktif', fix);
}

function checkNoClaudeMem(settings) {
  const found = Object.keys(settings?.enabledPlugins ?? {}).filter((p) => p.includes('claude-mem'));
  return result('Tanpa claude-mem (PRD §16.4)', found.length === 0, found.length ? `terpasang: ${found.join(', ')}` : 'ok', 'laporkan ke Bimo; hapus dari enabledPlugins');
}

function checkFindSkills() {
  const ok = existsSync(join(ROOT, '.claude', 'skills', 'find-skills'));
  return result('Skill find-skills', ok, ok ? '.claude/skills/find-skills' : 'tidak ada', 'npx -y skills add https://github.com/vercel-labs/skills --skill find-skills -a claude-code -y');
}

function checkSecurityReview() {
  const ok = existsSync(join(ROOT, '.claude', 'skills', 'security-review', 'SKILL.md'));
  return result('Skill security-review', ok, ok ? '.claude/skills/security-review' : 'tidak ada', 'salin skills/security-review dari github.com/affaan-m/ECC (lihat docs/setup/BOOTSTRAP.md Langkah 3)');
}

function checkImpeccable() {
  const ok = existsSync(join(ROOT, '.claude', 'skills', 'impeccable', 'SKILL.md'));
  return result('Skill impeccable', ok, ok ? '.claude/skills/impeccable' : 'tidak ada', 'npx --yes impeccable install --providers=claude --scope=project -y ; hapus .claude/agents/impeccable-*.md (docs/setup/BOOTSTRAP.md)');
}

function checkMcp(settings) {
  const declared = Object.keys(readJson(join(ROOT, '.mcp.json'))?.mcpServers ?? {});
  const enabled = settings?.enabledMcpjsonServers ?? [];
  const missing = REQUIRED_MCP_SERVERS.filter((s) => !declared.includes(s) || !enabled.includes(s));
  const fix = 'salin docs/setup/mcp.json → .mcp.json dan tambahkan ke enabledMcpjsonServers di .claude/settings.json';
  return result('MCP (playwright, context7, chrome-devtools)', missing.length === 0, missing.length ? `kurang: ${missing.join(', ')}` : 'terdaftar', fix);
}

// ---------- main ----------

async function collectResults() {
  const env = loadBackendEnv();
  const phpBin = env?.PHP_BIN || DEFAULT_PHP_BIN;
  const settings = readJson(join(ROOT, '.claude', 'settings.json'));
  const dbClient = findDbClient(env);
  return [
    checkVersion('Node.js', 'node', '22.22', 'winget upgrade --id OpenJS.NodeJS.22 --exact'),
    checkVersion('Git', 'git', '2.0', 'winget install --id Git.Git -e'),
    checkVersion('GitHub CLI', 'gh', '2.0', 'winget install --id GitHub.cli -e'),
    checkGhAuth(),
    checkVersion('Composer', 'composer', '2.7', 'winget install --id Composer.Composer -e'),
    checkPhp(phpBin),
    checkPhpExtensions(phpBin),
    checkBackendEnv(env),
    checkDbClient(dbClient),
    checkDbInPath(),
    checkDbService(),
    await checkDbPort(),
    checkDbVersion(dbClient, env),
    checkDbLogin(dbClient, env, env?.DB_NAME, 'DB dev'),
    checkDbLogin(dbClient, env, env?.DB_TEST_NAME || DEFAULT_TEST_DB, 'DB test'),
    await checkPortFree(5173, 'Vite'),
    await checkPortFree(8000, 'API PHP'),
    checkPlugins(settings),
    checkNoClaudeMem(settings),
    checkFindSkills(),
    checkSecurityReview(),
    checkImpeccable(),
    checkMcp(settings),
  ];
}

async function main() {
  const quiet = process.argv.includes('--quiet');
  const results = await collectResults();
  const failed = results.filter((r) => !r.ok).length;
  const lines = formatResults(results, { quiet });
  if (failed > 0 || !quiet) {
    const header = quiet ? `doctor: ${failed} item belum siap` : 'StudyKids doctor';
    process.stdout.write(`${[header, ...lines].join('\n')}\n`);
  }
  if (!quiet) process.stdout.write(`\n${results.length - failed}/${results.length} OK\n`);
  process.exitCode = failed > 0 ? 1 : 0;
}

main();
