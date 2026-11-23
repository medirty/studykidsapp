import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resetTarget } from './db-guard.mjs';

const base = { APP_ENV: 'local', DB_NAME: 'studykids_dev', DB_TEST_NAME: 'studykids_test' };

test('allows local dev database', () => {
  assert.deepEqual(resetTarget(base), {
    phinxEnv: 'development',
    dbVar: 'DB_NAME',
    db: 'studykids_dev',
  });
});

test('--test targets DB_TEST_NAME with the testing environment', () => {
  assert.deepEqual(resetTarget({ ...base, APP_ENV: 'testing' }, { test: true }), {
    phinxEnv: 'testing',
    dbVar: 'DB_TEST_NAME',
    db: 'studykids_test',
  });
});

test('refuses when APP_ENV is not local/testing', () => {
  for (const APP_ENV of ['production', 'staging', '', undefined, 'LOCAL']) {
    const result = resetTarget({ ...base, APP_ENV });
    assert.match(result.error, /APP_ENV/);
  }
});

test('refuses database names without _dev/_test suffix', () => {
  for (const DB_NAME of ['studykids', 'studykids_prod', 'studykids_dev_old', '', undefined]) {
    const result = resetTarget({ ...base, DB_NAME });
    assert.match(result.error, /DB_NAME/);
  }
});

test('refuses names with characters outside [A-Za-z0-9_]', () => {
  for (const DB_NAME of ['prod;_dev', 'x`_dev', 'a b_test', '"studykids_dev"']) {
    assert.ok(resetTarget({ ...base, DB_NAME }).error, DB_NAME);
  }
});

test('--test checks DB_TEST_NAME, not DB_NAME', () => {
  const result = resetTarget({ ...base, DB_TEST_NAME: 'studykids' }, { test: true });
  assert.match(result.error, /DB_TEST_NAME/);
});
