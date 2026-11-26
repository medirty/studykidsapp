<script lang="ts">
  import { t } from '../i18n';
  import Kiko from '../components/ui/Kiko.svelte';
</script>

<section>
  <Kiko mood="kaget" size={140} />
  <h1>{t('notfound.title')}</h1>
  <p>{t('notfound.body')}</p>
  <a href="#/">{t('notfound.back')}</a>
</section>

<style>
  section {
    text-align: center;
  }
  a {
    display: inline-block;
    min-height: var(--tap-min);
    line-height: var(--tap-min);
    color: var(--color-ink);
    font-weight: var(--weight-heading);
  }
</style>
