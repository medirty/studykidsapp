<script lang="ts">
  import { brand } from '../brand.config';
  import { t } from '../i18n';
  import { fetchHealth } from '../services/health';

  const showHealth = import.meta.env.VITE_API_MODE !== 'local';
  const health = showHealth ? fetchHealth() : null;
</script>

<section>
  <h1>{t('hello.title')}</h1>
  <p>{t('hello.subtitle', { brand: brand.name })}</p>
  <p class="status">{t('hello.status')}</p>
  {#if health}
    {#await health then h}
      <p class="health" data-state={h.api === 'ok' && h.db === 'ok' ? 'ok' : 'error'}>
        {t('dev.health', { api: h.api, db: h.db })}
      </p>
    {/await}
  {/if}
</section>

<style>
  section {
    text-align: center;
  }
  h1 {
    color: var(--color-ink);
    font-size: 2.25rem;
  }
  .status {
    display: inline-block;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    background: var(--color-sunny);
    color: var(--color-ink);
  }
  .health {
    margin-top: var(--space-4);
    color: var(--color-ink);
  }
</style>
