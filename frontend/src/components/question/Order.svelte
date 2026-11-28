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
    question: QuestionOf<'order'>;
    disabled?: boolean;
    onchange: (a: string[] | null) => void;
  } = $props();
  let seq = $state<string[]>([]);

  // Ketuk berurutan = nomor 1, 2, 3…; ketuk yang bernomor = batal. Baru dikirim bila lengkap.
  function tap(id: string) {
    seq = seq.includes(id) ? seq.filter((s) => s !== id) : [...seq, id];
    onchange(seq.length === question.items.length ? seq : null);
  }
</script>

<div class="stack">
  <QuestionPrompt prompt={question.prompt} />
  <div class="row">
    {#each question.items as item (item.id)}
      {@const n = seq.indexOf(item.id) + 1}
      <Tile
        label={choiceLabel(item)}
        pressed={n > 0}
        badge={n || undefined}
        {disabled}
        onclick={() => tap(item.id)}
      />
    {/each}
  </div>
</div>

<style>
  .stack {
    display: grid;
    gap: var(--space-4);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }
</style>
