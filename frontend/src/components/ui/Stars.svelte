<script lang="ts">
  import { t } from '../../i18n';
  import Icon from './Icon.svelte';

  let { value, max = 3 }: { value: number; max?: number } = $props();
</script>

<span class="stars" role="img" aria-label={t('ui.stars', { n: String(value), max: String(max) })}>
  {#each Array.from({ length: max }, (_, i) => i) as i (i)}
    <span class="star" class:on={i < value}><Icon name="star" size={28} /></span>
  {/each}
</span>

<style>
  .stars {
    display: inline-flex;
    gap: var(--space-1);
  }
  .star {
    color: var(--color-ink-soft);
    opacity: 0.45;
  }
  .on {
    color: var(--color-sunny);
    opacity: 1;
  }
  .on :global(path) {
    fill: currentcolor;
    stroke: var(--color-ink);
  }
</style>
