import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePhpBin } from './php-bin.mjs';

test('uses PHP_BIN from backend/.env when set', () => {
  assert.equal(resolvePhpBin('PHP_BIN=C:\\php-8.4\\php.exe\nDB_HOST=x'), 'C:\\php-8.4\\php.exe');
});

test('falls back to php when PHP_BIN is empty or missing', () => {
  assert.equal(resolvePhpBin('PHP_BIN=\n'), 'php');
  assert.equal(resolvePhpBin('DB_HOST=x'), 'php');
  assert.equal(resolvePhpBin(null), 'php');
});
