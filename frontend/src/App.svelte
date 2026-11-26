<script lang="ts">
  import Router from 'svelte-spa-router';
  import AppHeader from './components/AppHeader.svelte';
  import UpdatePrompt from './components/UpdatePrompt.svelte';
  import { routes } from './routes';
  import { registerSw } from './services/pwa';

  import { settings } from './stores/settings.svelte';

  settings.load();
  let needRefresh = $state(false);
  const reload = registerSw(() => (needRefresh = true));
</script>

<AppHeader />
<main>
  <Router {routes} />
</main>
<UpdatePrompt bind:needRefresh onreload={reload} />

<style>
  main {
    max-width: 32rem;
    margin: 0 auto;
    padding: var(--space-6) var(--space-4);
  }
</style>
