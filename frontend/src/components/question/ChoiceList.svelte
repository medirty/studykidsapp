<script lang="ts">
  import type { Choice } from '../../engine/types';
  import Icon from '../ui/Icon.svelte';
  import type { IconName } from '../ui/icons';
  import { choiceLabel } from './text';

  // Terpilih = border tebal + ikon ✓ (bukan warna saja, §8.5). `label`/`icon` opsional (Tf).
  let {
    choices,
    selected,
    disabled = false,
    lang,
    label = choiceLabel,
    icon,
    onselect,
  }: {
    choices: Choice[];
    selected: string[];
    disabled?: boolean;
    lang?: string;
    label?: (c: Choice) => string;
    icon?: (c: Choice) => IconName | undefined;
    onselect: (id: string) => void;
  } = $props();
</script>

<ul class="choices">
  {#each choices as c (c.id)}
    {@const on = selected.includes(c.id)}
    {@const lead = icon?.(c)}
    <li>
      <button
        class="choice"
        type="button"
        aria-pressed={on}
        {disabled}
        {lang}
        onclick={() => onselect(c.id)}
      >
        {#if lead}<Icon name={lead} size={24} />{/if}
        {label(c)}
        {#if on}<Icon name="check" size={24} />{/if}
      </button>
    </li>
  {/each}
</ul>

<style>
  .choices {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .choice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    width: 100%;
    min-height: 72px;
    padding: var(--space-2) var(--space-3);
    border: 2px solid var(--color-line);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-ink);
    font: var(--weight-heading) var(--text-xl) var(--font-heading);
    cursor: pointer;
  }
  .choice[aria-pressed='true'] {
    border: 3px solid var(--color-ink);
    background: var(--color-sunny);
  }
  .choice:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-offset);
  }
  .choice:disabled {
    cursor: not-allowed;
  }
</style>
