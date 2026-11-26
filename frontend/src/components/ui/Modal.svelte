<script lang="ts">
  import type { Snippet } from 'svelte';
  import { t } from '../../i18n';
  import Button from './Button.svelte';

  let { title, onclose, children }: { title: string; onclose: () => void; children: Snippet } =
    $props();

  let dialog: HTMLElement;
  const focusable = () =>
    [...dialog.querySelectorAll<HTMLElement>('button, [href], input, select, textarea')].filter(
      (el) => !el.hasAttribute('disabled'),
    );

  // Fokus masuk saat buka, kembali ke pemicu saat tutup.
  $effect(() => {
    const opener = document.activeElement as HTMLElement | null;
    focusable()[0]?.focus();
    return () => opener?.focus();
  });

  function trapTab(e: KeyboardEvent, items: HTMLElement[]) {
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    const edge = e.shiftKey ? first : last;
    if (document.activeElement !== edge) return;
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
    else if (e.key === 'Tab') trapTab(e, focusable());
  }
</script>

<div class="backdrop">
  <div
    bind:this={dialog}
    class="modal"
    role="dialog"
    aria-modal="true"
    aria-label={title}
    tabindex="-1"
    {onkeydown}
  >
    <h2>{title}</h2>
    {@render children()}
    <Button variant="secondary" onclick={onclose}>{t('ui.close')}</Button>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: var(--space-4);
    background: var(--color-overlay);
  }
  .modal {
    display: grid;
    gap: var(--space-4);
    width: 100%;
    max-width: 420px;
    max-height: 100%;
    overflow: auto;
    padding: var(--space-5);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    color: var(--color-ink);
  }
  h2 {
    margin: 0;
    font: var(--weight-heading) var(--text-xl) var(--font-heading);
  }
</style>
