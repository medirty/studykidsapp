<script lang="ts">
  import type { Choice, QuestionOf } from '../../engine/types';
  import { t } from '../../i18n';
  import ChoiceList from './ChoiceList.svelte';
  import QuestionPrompt from './QuestionPrompt.svelte';

  let {
    question,
    disabled = false,
    onchange,
  }: {
    question: QuestionOf<'tf'>;
    disabled?: boolean;
    onchange: (a: boolean | null) => void;
  } = $props();
  let picked = $state<string[]>([]);

  const choices: Choice[] = [{ id: 'true' }, { id: 'false' }];
  const label = (c: Choice) => t(c.id === 'true' ? 'q.true' : 'q.false');

  function select(id: string) {
    picked = [id];
    onchange(id === 'true');
  }
</script>

<div class="stack">
  <QuestionPrompt prompt={question.prompt} />
  <ChoiceList
    {choices}
    selected={picked}
    {disabled}
    {label}
    icon={(c) => (c.id === 'true' ? 'check' : 'cross')}
    onselect={select}
  />
</div>

<style>
  .stack {
    display: grid;
    gap: var(--space-4);
  }
</style>
