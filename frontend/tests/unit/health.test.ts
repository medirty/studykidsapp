import { describe, expect, it } from 'vitest';
import { fetchHealth } from '../../src/services/health';

const reply = (status: number, body: unknown) => async () =>
  new Response(JSON.stringify(body), { status });

describe('fetchHealth', () => {
  it('API ok, DB ok', async () => {
    const f = reply(200, { status: 'ok', db: 'ok' });
    expect(await fetchHealth(f)).toEqual({ api: 'ok', db: 'ok' });
  });

  it('API ok, DB error (503)', async () => {
    const f = reply(503, { status: 'ok', db: 'error' });
    expect(await fetchHealth(f)).toEqual({ api: 'ok', db: 'error' });
  });

  it('API tidak terjangkau → keduanya error', async () => {
    const f = async () => {
      throw new TypeError('network');
    };
    expect(await fetchHealth(f)).toEqual({ api: 'error', db: 'error' });
  });

  it('respons bukan JSON (proxy gagal) → keduanya error', async () => {
    const f = async () => new Response('Bad Gateway', { status: 502 });
    expect(await fetchHealth(f)).toEqual({ api: 'error', db: 'error' });
  });
});
