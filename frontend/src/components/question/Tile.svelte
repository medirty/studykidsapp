<script lang="ts">
  import Icon from '../ui/Icon.svelte';

  // Ubin ketuk bersama untuk DragDrop/Match/Order. Terpilih = border tebal + ikon ✓ atau nomor (§8.5).
  let {
    label,
    pressed = false,
    badge,
    disabled = false,
    onclick,
  }: {
    label: string;
    pressed?: boolean;
    badge?: number;
    disabled?: boolean;
    onclick: () => void;
  } = $props();
</script>

<button class="tile" type="button" aria-pressed={pressed} {disabled} {onclick}>
  {label}
  {#if badge}<span class="badge">{badge}</span>{:else if pressed}<Icon
      name="check"
      size={24}
    />{/if}
</button>

<style>
  .tile {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-width: 72px;
    min-height: 72px;
    padding: var(--space-2) var(--space-3);
    border: 2px solid var(--color-line);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-ink);
    font: var(--weight-heading) var(--text-xl) var(--font-heading);
    cursor: pointer;
  }
  .tile[aria-pressed='true'] {
    border: 3px solid var(--color-ink);
    background: var(--color-sunny);
  }
  .tile:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-offset);
  }
  .tile:disabled {
    cursor: not-allowed;
  }
  .badge {
    display: inline-grid;
    place-items: center;
    min-width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--color-ink);
    color: var(--color-surface);
    font-size: var(--text-lg);
  }
</style>
