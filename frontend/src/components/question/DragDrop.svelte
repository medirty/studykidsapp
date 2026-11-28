<script lang="ts">
  import type { QuestionOf } from '../../engine/types';
  import { t } from '../../i18n';
  import QuestionPrompt from './QuestionPrompt.svelte';
  import Tile from './Tile.svelte';
  import { choiceLabel } from './text';

  let {
    question,
    disabled = false,
    onchange,
  }: {
    question: QuestionOf<'dragdrop'>;
    disabled?: boolean;
    onchange: (a: Record<string, string> | null) => void;
  } = $props();
  let placed = $state<Record<string, string>>({});
  let sel = $state<string | null>(null);

  const pool = $derived(question.items.filter((i) => !(i.id in placed)));

  function emit() {
    onchange(Object.keys(placed).length === question.items.length ? { ...placed } : null);
  }
  // shortcut: hanya ketuk-untuk-pilih (aksesibel di sentuh & papan ketik), belum ada seret; tambah bila Bimo minta.
  function drop(targetId: string) {
    if (sel === null) return;
    placed = { ...placed, [sel]: targetId };
    sel = null;
    emit();
  }
  function back(itemId: string) {
    placed = Object.fromEntries(Object.entries(placed).filter(([id]) => id !== itemId));
    emit();
  }
</script>

<div class="stack">
  <QuestionPrompt prompt={question.prompt} />
  <p class="hint">{t('q.pickFirst')}</p>
  <div class="row">
    {#each pool as item (item.id)}
      <Tile
        label={choiceLabel(item)}
        pressed={sel === item.id}
        {disabled}
        onclick={() => (sel = sel === item.id ? null : item.id)}
      />
    {/each}
  </div>
  <div class="targets">
    {#each question.targets as target (target.id)}
      <section class="target">
        <button
          class="zone"
          type="button"
          disabled={disabled || sel === null}
          onclick={() => drop(target.id)}
        >
          {choiceLabel(target)}
        </button>
        <div class="row">
          {#each question.items.filter((i) => placed[i.id] === target.id) as item (item.id)}
            <Tile label={choiceLabel(item)} {disabled} onclick={() => back(item.id)} />
          {/each}
        </div>
      </section>
    {/each}
  </div>
</div>

<style>
  .stack {
    display: grid;
    gap: var(--space-4);
  }
  .hint {
    margin: 0;
    color: var(--color-ink-soft);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }
  .targets {
    display: grid;
    gap: var(--space-3);
  }
  .target {
    display: grid;
    gap: var(--space-2);
    padding: var(--space-3);
    border: 2px dashed var(--color-line);
    border-radius: var(--radius-md);
  }
  .zone {
    min-height: 56px;
    border: 2px solid var(--color-line);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-ink);
    font: var(--weight-heading) var(--text-lg) var(--font-heading);
    cursor: pointer;
  }
  .zone:not(:disabled) {
    border-color: var(--color-ink);
  }
  .zone:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-offset);
  }
  .zone:disabled {
    cursor: default;
  }
</style>
