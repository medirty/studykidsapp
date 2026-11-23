import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseEnv,
  extractVersion,
  versionAtLeast,
  missingPhpExtensions,
  missingKeys,
  pathContains,
  formatResults,
  pickDbClient,
  isMariaDb118,
} from './doctor-utils.mjs';

test('pickDbClient: first existing candidate wins, null when none', () => {
  const exists = (p) => p === 'B';
  assert.equal(pickDbClient(['A', 'B', 'C'], exists), 'B');
  assert.equal(pickDbClient(['', undefined, 'A'], exists), null);
});

test('isMariaDb118: only 11.8.x matches', () => {
  assert.equal(isMariaDb118('11.8.2-MariaDB'), true);
  assert.equal(isMariaDb118('10.4.32-MariaDB'), false);
  assert.equal(isMariaDb118('11.80.1'), false);
  assert.equal(isMariaDb118(undefined), false);
});

test('parseEnv reads keys, skips comments, strips quotes', () => {
  const env = parseEnv('# c\nDB_HOST=127.0.0.1\r\n\nDB_PASS="a=b"\nBAD\nPHP_BIN=\'C:\\php\'');
  assert.deepEqual(env, { DB_HOST: '127.0.0.1', DB_PASS: 'a=b', PHP_BIN: 'C:\\php' });
});

test('extractVersion finds first version', () => {
  assert.equal(extractVersion('v22.12.0'), '22.12.0');
  assert.equal(extractVersion('PHP 8.4.28 (cli) (built: ...)'), '8.4.28');
  assert.equal(extractVersion('Composer version 2.8'), '2.8.0');
  assert.equal(extractVersion('nothing'), null);
  assert.equal(extractVersion(undefined), null);
});

test('versionAtLeast compares numerically', () => {
  assert.equal(versionAtLeast('22.12.0', '22.12'), true);
  assert.equal(versionAtLeast('22.9.0', '22.12'), false);
  assert.equal(versionAtLeast('8.4.28', '8.4'), true);
  assert.equal(versionAtLeast('8.2.12', '8.4'), false);
  assert.equal(versionAtLeast('10.0.0', '9.9.9'), true);
  assert.equal(versionAtLeast(null, '1.0'), false);
});

test('missingPhpExtensions lists absent required modules', () => {
  const out = '[PHP Modules]\nCore\ncurl\nfileinfo\nintl\nmbstring\nopenssl\npdo_mysql\nzip\n';
  assert.deepEqual(missingPhpExtensions(out), ['sodium']);
});

test('missingKeys reports absent or empty keys', () => {
  assert.deepEqual(missingKeys({ A: '1', B: '' }, ['A', 'B', 'C']), ['B', 'C']);
});

test('pathContains ignores case and trailing slash', () => {
  const p = 'C:\\Windows;c:\\xampp\\mysql\\bin\\;C:\\tools';
  assert.equal(pathContains(p, 'C:\\xampp\\mysql\\bin'), true);
  assert.equal(pathContains(p, 'C:\\xampp\\php'), false);
  assert.equal(pathContains(undefined, 'C:\\x'), false);
});

test('formatResults prints marks, fixes, and quiet hides passes', () => {
  const results = [
    { name: 'Node', ok: true, detail: 'v22' },
    { name: 'PHP', ok: false, detail: 'tidak ada', fix: 'install' },
  ];
  assert.deepEqual(formatResults(results), [
    '✓ Node — v22',
    '✗ PHP — tidak ada',
    '    perbaiki: install',
  ]);
  assert.deepEqual(formatResults(results, { quiet: true }), [
    '✗ PHP — tidak ada',
    '    perbaiki: install',
  ]);
});
