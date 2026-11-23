// Safety guard for `npm run db:reset` (D-003): only local/testing envs and *_dev / *_test databases.
const ALLOWED_APP_ENVS = ['local', 'testing'];
const SAFE_DB_NAME = /^\w+_(dev|test)$/;

/** Returns { phinxEnv, dbVar, db } when the reset is allowed, otherwise { error }. */
export function resetTarget(env, { test = false } = {}) {
  const appEnv = env.APP_ENV ?? '';
  if (!ALLOWED_APP_ENVS.includes(appEnv)) {
    return {
      error: `APP_ENV="${appEnv}" tidak diizinkan. db:reset hanya jalan jika APP_ENV = local atau testing.`,
    };
  }
  const dbVar = test ? 'DB_TEST_NAME' : 'DB_NAME';
  const db = env[dbVar] ?? '';
  if (!SAFE_DB_NAME.test(db)) {
    return {
      error: `${dbVar}="${db}" ditolak. db:reset hanya untuk database berakhiran _dev atau _test (huruf/angka/underscore).`,
    };
  }
  return { phinxEnv: test ? 'testing' : 'development', dbVar, db };
}
