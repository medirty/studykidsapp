<script lang="ts">
  import { getLocale, t } from '../../i18n';
  import { speak, speechSupported } from '../../services/speech';
  import Icon from './Icon.svelte';

  let { text, large = false }: { text: string; large?: boolean } = $props();
  let fallback = $state(false);

  const supported = speechSupported();

  function onclick() {
    fallback = speak(text, getLocale()) === 'fallback';
  }
</script>

{#if supported}
  <button class="speak" class:large type="button" aria-label={t('speech.speak')} {onclick}>
    <Icon name="speaker" size={large ? 36 : 28} />
  </button>
  {#if fallback}<p class="note" role="status">{t('speech.fallback')}</p>{/if}
{/if}

<style>
  .speak {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--tap-min);
    height: var(--tap-min);
    border: 3px solid var(--color-ink);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    color: var(--color-ink);
    cursor: pointer;
  }
  .large {
    width: 72px;
    height: 72px;
  }
  .speak:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-offset);
  }
  .note {
    margin: var(--space-2) 0 0;
    font-size: var(--text-sm);
    color: var(--color-ink-soft);
  }
</style>
