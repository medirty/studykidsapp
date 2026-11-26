// Entitlement store (ADR D-011 b): UI gating only, the server enforces access (FR-10).
import { api as defaultApi } from '../services/api';
import type { Api, Entitlement } from '../services/types';

export class EntitlementStore {
  entitlement = $state<Entitlement>({ plan: 'demo', expiresAt: null });
  /** From PublicSettings.demo.unitLimit, the single source (not copied into code). */
  unitLimit = $state(0);

  constructor(private api: Api) {}

  get isFull(): boolean {
    return this.entitlement.plan === 'full';
  }

  async load(): Promise<void> {
    const [entitlement, pub] = await Promise.all([
      this.api.getEntitlement(),
      this.api.getPublicSettings(),
    ]);
    this.entitlement = entitlement;
    this.unitLimit = pub.demo.unitLimit;
  }
}

export const createEntitlementStore = (api: Api) => new EntitlementStore(api);
export const entitlement = createEntitlementStore(defaultApi);
