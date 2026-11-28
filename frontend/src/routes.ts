import wrap from 'svelte-spa-router/wrap';
import Home from './routes/Home.svelte';
import Landing from './routes/Landing.svelte';
import NotFound from './routes/NotFound.svelte';
import Start from './routes/Start.svelte';

// Peta route: ADR D-011 (a). Route lazy Fase 3+ memakai wrap({ asyncComponent }).
export const routes = {
  '/': Landing,
  '/start': Start,
  '/home': Home,
  '/map/:subject': wrap({ asyncComponent: () => import('./routes/Map.svelte') }),
  '/session/:skillId': wrap({ asyncComponent: () => import('./routes/Session.svelte') }),
  '*': NotFound,
};
