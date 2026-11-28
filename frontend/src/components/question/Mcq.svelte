<script lang="ts">
  import type { QuestionOf } from '../../engine/types';
  import ChoiceList from './ChoiceList.svelte';
  import QuestionPrompt from './QuestionPrompt.svelte';

  // Kontrak semua komponen soal: `onchange` dipanggil tiap jawaban berubah (null = belum ada);
  // tombol "Periksa" dimiliki layar sesi (T3.15), induk me-remount per soal.
  let {
    question,
    disabled = false,
    onchange,
  }: {
    question: QuestionOf<'mcq'>;
    disabled?: boolean;
    onchange: (a: string | null) => void;
  } = $props();
  let picked = $state<string[]>([]);

  function select(id: string) {
    picked = [id];
    onchange(id);
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
