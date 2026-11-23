export type HealthState = 'ok' | 'error';
export interface Health {
  api: HealthState;
  db: HealthState;
}

/** Reads GET /api/health; any failure (network, proxy error, non-JSON) counts as API down. */
export async function fetchHealth(doFetch: typeof fetch = fetch): Promise<Health> {
  try {
    const body = (await (await doFetch('/api/health')).json()) as { db?: string };
    return { api: 'ok', db: body.db === 'ok' ? 'ok' : 'error' };
  } catch {
    return { api: 'error', db: 'error' };
  }
}
