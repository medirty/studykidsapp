<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  import type { IconName } from './icons';

  // Status = ikon + teks; terpilih = border tebal + ✓ (bukan warna saja).
  let {
    icon,
    selected = false,
    children,
  }: { icon?: IconName; selected?: boolean; children: Snippet } = $props();
</script>

<span class="chip" class:selected>
  {#if selected}<Icon name="check" size={16} />{:else if icon}<Icon name={icon} size={16} />{/if}
  {@render children()}
</span>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-3);
    border: 2px solid var(--color-line);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    color: var(--color-ink);
    font: var(--weight-strong) var(--text-xs) var(--font-body);
  }
  .selected {
    border: 3px solid var(--color-ink);
  }
</style>
