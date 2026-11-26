<script lang="ts">
  import { getLocale, t, type MessageKey } from '../i18n';
  import { fetchHealth } from '../services/health';
  import { api } from '../services/api';
  import type { PublicSettings, SubjectId } from '../services/types';
  import Card from '../components/ui/Card.svelte';
  import Kiko from '../components/ui/Kiko.svelte';

  const subjects: SubjectId[] = [
    'math',
    'english',
    'science',
    'gp',
    'wellbeing',
    'art',
    'music',
    'computing',
  ];
  const whys = [1, 2, 3] as const;
  const faqs = [1, 2, 3] as const;
  const choices = [8, 9, 10];

  const showHealth = import.meta.env.VITE_API_MODE !== 'local';
  const health = showHealth ? fetchHealth() : null;

  let pub = $state<PublicSettings | null>(null);
  let picked = $state<number | null>(null);
  api
    .getPublicSettings()
    .then((s) => (pub = s))
    .catch(() => (pub = null));

  const rp = (n: number) => n.toLocaleString(getLocale() === 'id' ? 'id-ID' : 'en-US');
  const money = (n: number) => `Rp${rp(n)}`;

  // Meta SEO ikut bahasa (FR-1, FR-3).
  $effect(() => {
    document.title = t('landing.metaTitle');
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t('landing.metaDesc'));
  });
</script>

<div class="landing">
  <section class="hero" aria-labelledby="h-hero">
    <Kiko size={160} />
    <h1 id="h-hero">{t('landing.title')}</h1>
    <p>{t('landing.lead')}</p>
    <a class="cta" href="#/start">{t('landing.cta')}</a>
  </section>

  <section aria-labelledby="h-why">
    <h2 id="h-why">{t('landing.whyTitle')}</h2>
    <ul class="list">
      {#each whys as n (n)}
        <li>
          <Card>
            <strong>{t(`landing.why${n}.title`)}</strong>
            <p>{t(`landing.why${n}.body`)}</p>
          </Card>
        </li>
      {/each}
    </ul>
  </section>

  <section aria-labelledby="h-subj">
    <h2 id="h-subj">{t('landing.subjectsTitle')}</h2>
    <ul class="subjects">
      {#each subjects as s (s)}
        <li style:--c="var(--subject-{s})">
          <span class="name">{t(`subject.${s}` as MessageKey)}</span>
          {#if (pub?.demo.subjects ?? ['math', 'gp', 'art']).includes(s)}
            <small>{t('landing.free')}</small>
          {/if}
        </li>
      {/each}
    </ul>
    <p class="note">{t('landing.freeNote', { units: String(pub?.demo.unitLimit ?? 2) })}</p>
  </section>

  <section aria-labelledby="h-try">
    <Card>
      <h2 id="h-try">{t('landing.tryTitle')}</h2>
      <p>{t('landing.tryQuestion')}</p>
      <div class="choices">
        {#each choices as c (c)}
          <button type="button" aria-pressed={picked === c} onclick={() => (picked = c)}>
            {c}
          </button>
        {/each}
      </div>
      <p class="result" role="status">
        {#if picked !== null}{t(picked === 9 ? 'landing.tryOk' : 'landing.tryRetry')}{/if}
      </p>
    </Card>
  </section>

  {#if pub}
    <section aria-labelledby="h-price">
      <Card>
        <h2 id="h-price">{t('landing.priceTitle')}</h2>
        <p class="price">
          {money(pub.priceEarlyMonthly)}<small> / {t('landing.perMonth')}</small>
        </p>
        <p>
          {t('landing.priceNow', {
            early: rp(pub.priceEarlyMonthly),
            normal: rp(pub.priceNormalMonthly),
          })}
        </p>
        {#if pub.earlyBirdSlotsLeft !== null}
          <p class="slots">{t('landing.slots', { n: String(pub.earlyBirdSlotsLeft) })}</p>
        {/if}
        <p class="note">{t('landing.priceNote')}</p>
      </Card>
    </section>
  {/if}

  <section aria-labelledby="h-faq">
    <h2 id="h-faq">{t('landing.faqTitle')}</h2>
    {#each faqs as n (n)}
      <details>
        <summary>{t(`landing.faq${n}.q`)}</summary>
        <p>{t(`landing.faq${n}.a`)}</p>
      </details>
    {/each}
  </section>

  <footer class="note">{t('landing.disclaimer')}</footer>

  {#if health}
    {#await health then h}
      <p class="note" data-state={h.api === 'ok' && h.db === 'ok' ? 'ok' : 'error'}>
        {t('dev.health', { api: h.api, db: h.db })}
      </p>
    {/await}
  {/if}
</div>

<style>
  .landing {
    display: grid;
    gap: var(--space-6);
  }
  .hero {
    display: grid;
    gap: var(--space-4);
    justify-items: center;
    text-align: center;
  }
  h1 {
    color: var(--color-ink);
    font-size: var(--text-2xl);
  }
  h2 {
    font-size: var(--text-xl);
    margin-bottom: var(--space-3);
  }
  .cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--tap-min);
    padding: 0 var(--space-6);
    border: 3px solid var(--color-ink);
    border-radius: var(--radius-full);
    background: var(--color-primary);
    color: var(--color-ink);
    font: var(--weight-heading) var(--text-lg) var(--font-heading);
    text-decoration: none;
  }
  .cta:focus-visible,
  button:focus-visible,
  summary:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-offset);
  }
  .list,
  .subjects {
    display: grid;
    gap: var(--space-3);
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .subjects {
    grid-template-columns: repeat(2, 1fr);
  }
  .subjects li {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
    padding: var(--space-3);
    background: var(--color-surface);
    border: 2px solid var(--color-line);
    border-left: 8px solid var(--c);
    border-radius: var(--radius-md);
    color: var(--color-ink);
  }
  .name {
    font: var(--weight-heading) var(--text-sm) var(--font-heading);
    overflow-wrap: anywhere;
  }
  small {
    color: var(--color-ink-soft);
    font-size: var(--text-xs);
  }
  .choices {
    display: grid;
    gap: var(--space-3);
  }
  .choices button {
    min-height: 56px;
    border: 3px solid var(--color-ink);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-ink);
    font: var(--weight-heading) var(--text-lg) var(--font-heading);
    cursor: pointer;
  }
  .choices button[aria-pressed='true'] {
    background: var(--color-sunny);
  }
  .result {
    min-height: 1.5em;
    font-weight: var(--weight-strong);
  }
  .price {
    font: var(--weight-heading) var(--text-3xl) var(--font-heading);
    text-align: center;
  }
  .slots {
    font-weight: var(--weight-strong);
  }
  details {
    border-bottom: 1px solid var(--color-line);
    padding: var(--space-3) 0;
  }
  summary {
    display: flex;
    align-items: center;
    min-height: var(--tap-min);
    font-weight: var(--weight-strong);
    cursor: pointer;
  }
  .note {
    color: var(--color-ink-soft);
    font-size: var(--text-xs);
  }
</style>
