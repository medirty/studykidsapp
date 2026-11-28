<script lang="ts">
  import { onDestroy } from 'svelte';
  import Kiko from './Kiko.svelte';

  let { size = 120 }: { size?: number } = $props();
  let happy = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  // Sentuhan = Kiko semangat + lompat kecil, lalu kembali (animasi mati saat reduced-motion).
  const poke = () => {
    clearTimeout(timer);
    happy = true;
    timer = setTimeout(() => (happy = false), 1200);
  };
  onDestroy(() => clearTimeout(timer));
</script>

<button type="button" class="kiko-btn" class:is-happy={happy} onclick={poke}>
  <Kiko mood={happy ? 'semangat' : 'senang'} {size} />
</button>

<style>
  .kiko-btn {
    flex: none;
    border: 0;
    background: none;
    padding: 0;
    cursor: pointer;
    border-radius: var(--radius-full);
    min-width: var(--tap-min);
    min-height: var(--tap-min);
  }
  .kiko-btn:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-offset);
  }
  .is-happy :global(img) {
    animation: kiko-hop var(--duration-slow) var(--ease-bounce);
  }
  @keyframes kiko-hop {
    0% {
      transform: translateY(0) scale(1);
    }
    40% {
      transform: translateY(-14px) scale(1.08);
    }
    100% {
      transform: translateY(0) scale(1);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .is-happy :global(img) {
      animation: none;
    }
  }
</style>
