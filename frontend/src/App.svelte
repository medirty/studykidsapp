<script lang="ts">
  import Router from 'svelte-spa-router';
  import AppHeader from './components/AppHeader.svelte';
  import { routes } from './routes';
</script>

<AppHeader />
<main>
  <Router {routes} />
</main>

<style>
  main {
    max-width: 32rem;
    margin: 0 auto;
    padding: var(--space-6) var(--space-4);
  }
</style>
