import { afterEach, describe, expect, it, vi } from 'vitest';
import { uuidV4 } from '../../src/lib/uuid';

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('uuidV4', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns a v4 UUID', () => {
    expect(uuidV4()).toMatch(V4);
  });

  it('falls back to getRandomValues when randomUUID is missing (Safari iOS 15.0–15.3)', () => {
    const real = crypto;
    vi.stubGlobal('crypto', { getRandomValues: real.getRandomValues.bind(real) });
    const ids = new Set(Array.from({ length: 200 }, uuidV4));
    expect(ids.size).toBe(200);
    for (const id of ids) expect(id).toMatch(V4);
  });
});
