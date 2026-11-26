<script lang="ts">
  import Router from 'svelte-spa-router';
  import AppHeader from './components/AppHeader.svelte';
  import UpdatePrompt from './components/UpdatePrompt.svelte';
  import { routes } from './routes';
  import { registerSw } from './services/pwa';

  import { brand } from './brand.config';
  import { t, type MessageKey } from './i18n';
  import { settings } from './stores/settings.svelte';

  settings.load();
  const titleKeys: Record<string, MessageKey> = {
    '/': 'landing.metaTitle',
    '/start': 'start.title',
    '/home': 'home.title',
  };
  const pathOf = () => window.location.hash.slice(1).split('?')[0] || '/';
  let path = $state(pathOf());
  // Judul tab per route, ikut bahasa (L-7).
  $effect(() => {
    const key = titleKeys[path] ?? 'notfound.title';
    document.title = key === 'landing.metaTitle' ? t(key) : `${t(key)} — ${brand.name}`;
  });
  let needRefresh = $state(false);
  const reload = registerSw(() => (needRefresh = true));
</script>

<svelte:window onhashchange={() => (path = pathOf())} />
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
