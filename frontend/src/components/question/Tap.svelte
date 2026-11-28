<script lang="ts">
  import type { QuestionOf } from '../../engine/types';
  import ChoiceList from './ChoiceList.svelte';
  import QuestionPrompt from './QuestionPrompt.svelte';

  let {
    question,
    disabled = false,
    onchange,
  }: {
    question: QuestionOf<'tap'>;
    disabled?: boolean;
    onchange: (a: string[] | null) => void;
  } = $props();
  let picked = $state<string[]>([]);

  // Ketuk lagi = batal pilih; jawaban = himpunan semua pilihan.
  function select(id: string) {
    picked = picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id];
    onchange(picked.length ? picked : null);
  }
</script>

<div class="stack">
  <QuestionPrompt prompt={question.prompt} />
  <ChoiceList choices={question.choices} selected={picked} {disabled} onselect={select} />
</div>

<style>
  .stack {
    display: grid;
    gap: var(--space-4);
  }
</style>
