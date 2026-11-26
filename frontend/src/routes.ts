import Home from './routes/Home.svelte';
import Landing from './routes/Landing.svelte';
import NotFound from './routes/NotFound.svelte';
import Start from './routes/Start.svelte';

// Peta route: ADR D-011 (a). Route lazy Fase 3+ memakai wrap({ asyncComponent }).
export const routes = {
  '/': Landing,
  '/start': Start,
  '/home': Home,
  '*': NotFound,
};
