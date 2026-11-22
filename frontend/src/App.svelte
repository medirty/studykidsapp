<script lang="ts">
  import { brand } from './brand.config';
  import { t } from './i18n';
</script>

<main>
  <h1>{t('hello.title')}</h1>
  <p>{t('hello.subtitle', { brand: brand.name })}</p>
  <p class="status">{t('hello.status')}</p>
</main>

<style>
  main {
    max-width: 32rem;
    margin: 0 auto;
    padding: var(--space-6) var(--space-4);
    text-align: center;
  }

  h1 {
    color: var(--color-ink);
    font-size: 2.25rem;
  }

  .status {
    display: inline-block;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    background: var(--color-sunny);
    color: var(--color-ink);
  }
</style>
