<script lang="ts">
  import { onMount } from 'svelte';
  import type { LocalizedText } from '../../engine/types';
  import { getLocale } from '../../i18n';
  import { speak } from '../../services/speech';
  import { settings } from '../../stores/settings.svelte';
  import SpeakButton from '../ui/SpeakButton.svelte';
  import { loc } from './text';

  let { prompt, speakText }: { prompt: LocalizedText; speakText?: LocalizedText } = $props();

  // Auto-baca hanya bila diaktifkan (FR-8); tanpa Web Speech = diam.
  onMount(() => {
    if (settings.prefs.autoRead) speak(loc(speakText ?? prompt), getLocale());
  });
</script>

<div class="prompt">
  <h1>{loc(prompt)}</h1>
  <SpeakButton text={loc(speakText ?? prompt)} />
</div>

<style>
  .prompt {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
  }
  h1 {
    flex: 1;
    margin: 0;
    font-size: var(--text-lg);
  }
</style>
