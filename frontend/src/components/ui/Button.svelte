<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    variant = 'primary',
    large = false,
    disabled = false,
    type = 'button',
    onclick,
    children,
  }: {
    variant?: 'primary' | 'secondary';
    large?: boolean; // kelas 1-2: 72 px
    disabled?: boolean;
    type?: 'button' | 'submit';
    onclick?: (e: MouseEvent) => void;
    children: Snippet;
  } = $props();
</script>

<button class="btn {variant}" class:large {type} {disabled} {onclick}>{@render children()}</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: var(--tap-min);
    padding: 0 var(--space-5);
    border: 3px solid var(--color-ink);
    border-radius: var(--radius-full);
    font: var(--weight-heading) var(--text-md) var(--font-heading);
    cursor: pointer;
    transition: transform var(--duration-fast) var(--ease-out);
  }
  .btn:active:not(:disabled) {
    transform: scale(0.97);
  }
  .btn:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-offset);
  }
  .primary {
    background: var(--color-primary);
    color: var(--color-ink);
  }
  .secondary {
    background: var(--color-surface);
    color: var(--color-ink);
  }
  .large {
    min-height: 72px;
    font-size: var(--text-lg);
  }
  .btn:disabled {
    background: var(--color-line);
    color: var(--color-ink-soft);
    border-style: dashed;
    cursor: not-allowed;
  }
</style>
