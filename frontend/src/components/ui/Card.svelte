<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

<div class="card">{@render children()}</div>

<style>
  .card {
    background: var(--color-surface);
    border: 2px solid var(--color-line);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    padding: var(--space-4);
    color: var(--color-ink);
  }
</style>
