<script lang="ts">
  import type { QuestionOf } from '../../engine/types';
  import { t } from '../../i18n';
  import SpeakButton from '../ui/SpeakButton.svelte';
  import ChoiceList from './ChoiceList.svelte';
  import QuestionPrompt from './QuestionPrompt.svelte';
  import { loc } from './text';

  let {
    question,
    disabled = false,
    onchange,
  }: {
    question: QuestionOf<'listen'>;
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
  <p class="center"><SpeakButton text={loc(question.speak)} large /></p>
  <p class="hint">{t('q.listenHint')}</p>
  <ChoiceList choices={question.choices} selected={picked} {disabled} onselect={select} />
</div>

<style>
  .stack {
    display: grid;
    gap: var(--space-4);
  }
  .center {
    margin: 0;
    text-align: center;
  }
  .hint {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-ink-soft);
  }
</style>
