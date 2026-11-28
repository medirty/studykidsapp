<script lang="ts">
  import type { QuestionOf } from '../../engine/types';
  import QuestionPrompt from './QuestionPrompt.svelte';
  import Tile from './Tile.svelte';
  import { choiceLabel } from './text';

  let {
    question,
    disabled = false,
    onchange,
  }: {
    question: QuestionOf<'match'>;
    disabled?: boolean;
    onchange: (a: Record<string, string> | null) => void;
  } = $props();
  let pairs = $state<[string, string][]>([]);
  let sel = $state<string | null>(null);

  const numOf = (side: 0 | 1, id: string) => pairs.findIndex((p) => p[side] === id) + 1;

  function emit() {
    onchange(pairs.length === question.left.length ? Object.fromEntries(pairs) : null);
  }
  // Pilih kiri, lalu kanan = pasangan bernomor. Mengetuk kiri yang berpasangan melepas pasangannya.
  function tapLeft(id: string) {
    pairs = pairs.filter((p) => p[0] !== id);
    sel = sel === id ? null : id;
    emit();
  }
  function tapRight(id: string) {
    if (sel === null) return;
    pairs = [...pairs.filter((p) => p[1] !== id), [sel, id]];
    sel = null;
    emit();
  }
</script>

<div class="stack">
  <QuestionPrompt prompt={question.prompt} />
  <div class="cols">
    <div class="col">
      {#each question.left as l (l.id)}
        <Tile
          label={choiceLabel(l)}
          pressed={sel === l.id || numOf(0, l.id) > 0}
          badge={numOf(0, l.id) || undefined}
          {disabled}
          onclick={() => tapLeft(l.id)}
        />
      {/each}
    </div>
    <div class="col">
      {#each question.right as r (r.id)}
        <Tile
          label={choiceLabel(r)}
          pressed={numOf(1, r.id) > 0}
          badge={numOf(1, r.id) || undefined}
          disabled={disabled || sel === null}
          onclick={() => tapRight(r.id)}
        />
      {/each}
    </div>
  </div>
</div>

<style>
  .stack {
    display: grid;
    gap: var(--space-4);
  }
  .cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }
  .col {
    display: grid;
    align-content: start;
    gap: var(--space-3);
  }
</style>
