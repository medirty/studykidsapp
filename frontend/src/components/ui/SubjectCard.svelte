<script lang="ts">
  import { t } from '../../i18n';
  import Icon from './Icon.svelte';

  type SubjectId =
    'math' | 'english' | 'science' | 'gp' | 'wellbeing' | 'art' | 'music' | 'computing';

  // title = nama mapel (sudah lewat t()). Warna mapel dari token; kunci = ikon + teks.
  let {
    subject,
    title,
    locked = false,
    onclick,
  }: { subject: SubjectId; title: string; locked?: boolean; onclick?: () => void } = $props();
</script>

<button class="subject" style:--c="var(--subject-{subject})" {onclick}>
  <span class="title">{title}</span>
  {#if locked}<span class="lock"><Icon name="lock" size={18} />{t('ui.locked')}</span>{/if}
</button>

<style>
  .subject {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
    min-height: 72px;
    width: 100%;
    padding: var(--space-4);
    background: var(--color-surface);
    border: 2px solid var(--color-line);
    border-left: 12px solid var(--c);
    border-radius: var(--radius-md);
    color: var(--color-ink);
    cursor: pointer;
    text-align: left;
  }
  .subject:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-offset);
  }
  .title {
    font: var(--weight-heading) var(--text-lg) var(--font-heading);
  }
  .lock {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font: var(--weight-strong) var(--text-xs) var(--font-body);
    color: var(--color-ink-soft);
  }
</style>
