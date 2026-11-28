<script lang="ts">
  import type { QuestionOf } from '../../engine/types';
  import { t } from '../../i18n';
  import Icon from '../ui/Icon.svelte';
  import QuestionPrompt from './QuestionPrompt.svelte';

  let {
    question,
    disabled = false,
    onchange,
  }: {
    question: QuestionOf<'input'>;
    disabled?: boolean;
    onchange: (a: string | null) => void;
  } = $props();
  let value = $state('');

  const MAX = 9;
  const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0'];

  function set(next: string) {
    value = next;
    onchange(next === '' ? null : next);
  }
  function press(key: string) {
    if (disabled) return;
    if (key === 'del') set(value.slice(0, -1));
    else if (value.length < MAX) set(value + key);
  }
  // Papan ketik fisik: angka & Backspace (fokus di keypad naik ke sini).
  function onkeydown(e: KeyboardEvent) {
    if (/^\d$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('del');
  }
</script>

<div class="stack">
  <QuestionPrompt prompt={question.prompt} />
  {#if question.inputMode === 'text'}
    <input
      class="text"
      type="text"
      aria-label={t('q.typeAnswer')}
      autocomplete="off"
      {disabled}
      {value}
      oninput={(e) => set(e.currentTarget.value)}
    />
  {:else}
    <div class="answer" role="status" aria-label={t('q.yourAnswer')}>{value || '?'}</div>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="keypad" {onkeydown}>
      {#each KEYS as key (key)}
        <button
          class="key"
          type="button"
          {disabled}
          aria-label={key === 'del' ? t('q.delete') : undefined}
          onclick={() => press(key)}
        >
          {#if key === 'del'}<Icon name="arrow-left" size={24} />{:else}{key}{/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .stack {
    display: grid;
    gap: var(--space-4);
  }
  .answer,
  .text {
    display: grid;
    place-items: center;
    min-height: 72px;
    border: 2px dashed var(--color-ink-soft);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-ink);
    font: var(--weight-heading) var(--text-2xl) var(--font-heading);
    text-align: center;
  }
  .keypad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-2);
  }
  .key {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 56px;
    border: 2px solid var(--color-line);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-ink);
    font: var(--weight-heading) var(--text-xl) var(--font-heading);
    cursor: pointer;
  }
  .key:focus-visible,
  .text:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-offset);
  }
  .key:disabled {
    cursor: not-allowed;
  }
</style>
