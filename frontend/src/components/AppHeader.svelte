<script lang="ts">
  import { brand } from '../brand.config';
  import { getLocale, setLocale, t } from '../i18n';
  import Kiko from './ui/Kiko.svelte';

  const toggle = () => setLocale(getLocale() === 'id' ? 'en' : 'id');
</script>

<header>
  <a class="logo" href="#/" aria-label={t('header.home', { brand: brand.name })}>
    <Kiko size={40} />
    <span>{brand.name}</span>
  </a>
  <button type="button" class="lang" aria-label={t('header.switchLang')} onclick={toggle}>
    {t('header.langCode')}
  </button>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2) var(--space-4);
    border-bottom: 3px solid var(--color-ink);
  }
  .logo {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: var(--tap-min);
    color: var(--color-ink);
    font: var(--weight-heading) var(--text-md) var(--font-heading);
    text-decoration: none;
  }
  .lang {
    min-width: var(--tap-min);
    min-height: var(--tap-min);
    border: 3px solid var(--color-ink);
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--color-ink);
    font: var(--weight-heading) var(--text-md) var(--font-heading);
    cursor: pointer;
  }
  a:focus-visible,
  .lang:focus-visible {
    outline: 3px solid var(--color-ink);
    outline-offset: 2px;
  }
</style>
