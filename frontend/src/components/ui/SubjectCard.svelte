<script lang="ts">
  import { t } from '../../i18n';
  import type { SubjectId } from '../../services/types';
  import Icon from './Icon.svelte';
  import { subjectUrl } from './subjectArt';

  // title = nama mapel (sudah lewat t()). Warna & teks dari token mapel; status = ikon + teks.
  let {
    subject,
    title,
    locked = false,
    note,
    onclick,
  }: {
    subject: SubjectId;
    title: string;
    locked?: boolean;
    note?: string;
    onclick?: () => void;
  } = $props();
</script>

<button
  class="subject"
  class:locked
  style:--c="var(--subject-{subject})"
  style:--tt="var(--subject-{subject}-text)"
  {onclick}
>
  <span class="tag">
    <Icon name={locked ? 'lock' : 'check'} size={16} />{locked ? t('ui.locked') : t('ui.free')}
  </span>
  <img src={subjectUrl(subject)} alt="" width="72" height="72" loading="lazy" />
  <span class="title">{title}</span>
  {#if note}<small>{note}</small>{/if}
</button>

<style>
  .subject {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-1);
    min-height: 148px;
    width: 100%;
    padding: var(--space-3);
    background: var(--c);
    border: 0;
    border-radius: var(--radius-md);
    color: var(--tt);
    cursor: pointer;
    text-align: center;
    box-shadow: 0 4px 0 var(--color-ink);
  }
  .subject:active {
    transform: translateY(4px);
    box-shadow: none;
  }
  .subject:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-offset);
  }
  img {
    width: 72px;
    height: 72px;
  }
  .title {
    font: var(--weight-heading) var(--text-md) var(--font-heading);
    line-height: var(--leading-tight);
  }
  small {
    font: var(--weight-strong) var(--text-xs) var(--font-body);
  }
  .tag {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: 2px var(--space-2);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    color: var(--color-ink);
    font: var(--weight-strong) var(--text-xs) var(--font-body);
  }
  .locked .tag {
    background: var(--color-ink);
    color: var(--color-ink-on-dark);
  }
  @media (prefers-reduced-motion: reduce) {
    .subject:active {
      transform: none;
    }
  }
</style>
