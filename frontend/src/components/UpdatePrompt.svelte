<script lang="ts">
  import { t } from '../i18n';

  // needRefresh = true saat service worker baru menunggu; user yang memutuskan kapan muat ulang (PRD §8.2).
  let {
    needRefresh = $bindable(false),
    onreload,
  }: { needRefresh?: boolean; onreload: () => void } = $props();
</script>

{#if needRefresh}
  <div class="prompt" role="status">
    <span>{t('pwa.update')}</span>
    <button type="button" class="primary" onclick={onreload}>{t('pwa.reload')}</button>
    <button type="button" onclick={() => (needRefresh = false)}>{t('pwa.later')}</button>
  </div>
{/if}

<style>
  .prompt {
    position: fixed;
    inset: auto var(--space-4) var(--space-4);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    border: 3px solid var(--color-ink);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    color: var(--color-ink);
  }
  span {
    flex: 1 1 12rem;
  }
  button {
    min-height: var(--tap-min);
    padding: 0 var(--space-4);
    border: 3px solid var(--color-ink);
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--color-ink);
    font: var(--weight-heading) var(--text-md) var(--font-heading);
    cursor: pointer;
  }
  .primary {
    background: var(--color-ink);
    color: var(--color-ink-on-dark);
  }
  button:focus-visible {
    outline: 3px solid var(--color-ink);
    outline-offset: 2px;
  }
</style>
