<script lang="ts">
  import type { Answer, Question } from '../../engine/types';
  import DragDrop from './DragDrop.svelte';
  import Draw from './Draw.svelte';
  import Input from './Input.svelte';
  import Listen from './Listen.svelte';
  import Match from './Match.svelte';
  import Mcq from './Mcq.svelte';
  import Order from './Order.svelte';
  import Tap from './Tap.svelte';
  import Tf from './Tf.svelte';

  // Satu pintu ke 9 komponen soal; induk me-remount (`{#key}`) per soal.
  let {
    question,
    disabled = false,
    onchange,
  }: { question: Question; disabled?: boolean; onchange: (a: Answer | null) => void } = $props();
</script>

{#if question.format === 'mcq'}
  <Mcq {question} {disabled} {onchange} />
{:else if question.format === 'input'}
  <Input {question} {disabled} {onchange} />
{:else if question.format === 'tf'}
  <Tf {question} {disabled} {onchange} />
{:else if question.format === 'tap'}
  <Tap {question} {disabled} {onchange} />
{:else if question.format === 'listen'}
  <Listen {question} {disabled} {onchange} />
{:else if question.format === 'dragdrop'}
  <DragDrop {question} {disabled} {onchange} />
{:else if question.format === 'match'}
  <Match {question} {disabled} {onchange} />
{:else if question.format === 'order'}
  <Order {question} {disabled} {onchange} />
{:else}
  <Draw {question} {disabled} {onchange} />
{/if}
