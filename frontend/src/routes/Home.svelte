<script lang="ts">
  import { getLocale, t, type MessageKey } from '../i18n';
  import { api } from '../services/api';
  import { speak } from '../services/speech';
  import type { PublicSettings, SubjectId } from '../services/types';
  import type { AvatarId } from '../components/ui/avatars';
  import Avatar from '../components/ui/Avatar.svelte';
  import Card from '../components/ui/Card.svelte';
  import KikoButton from '../components/ui/KikoButton.svelte';
  import SubjectCard from '../components/ui/SubjectCard.svelte';
  import { profile } from '../stores/profile.svelte';

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
  let pub = $state<PublicSettings | null>(null);
  api
    .getPublicSettings()
    .then((s) => (pub = s))
    .catch(() => (pub = null));

  const me = $derived(profile.active);
  const free = (s: SubjectId) => (pub?.demo.subjects ?? ['math', 'gp', 'art']).includes(s);
  // Kelas 1–2 belum lancar membaca: ketuk ubin membacakan nama mapel (FR-8, tanpa suara = diam).
  const readAloud = (s: SubjectId) => {
    if (me && me.grade <= 2) speak(t(`subject.${s}` as MessageKey), getLocale());
  };
</script>

<h1>{t('home.title')}</h1>

{#if me}
  <section class="hello" aria-labelledby="h-hi">
    <KikoButton size={96} />
    <Avatar id={me.avatarId as AvatarId} size={72} decorative />
    <div>
      <h2 id="h-hi">{t('home.hello', { name: me.nickname })}</h2>
      <p>{t('start.gradeN', { n: String(me.grade) })}</p>
    </div>
  </section>

  <Card>
    <p role="status">{t('home.streak')}</p>
    <p>{t('home.continue')}</p>
  </Card>

  <section aria-labelledby="h-sub">
    <h2 id="h-sub">{t('home.subjects')}</h2>
    <ul class="subjects">
      {#each subjects as s (s)}
        <li>
          <SubjectCard
            subject={s}
            title={t(`subject.${s}` as MessageKey)}
            locked={!free(s)}
            note={free(s) ? t('home.free', { n: String(pub?.demo.unitLimit ?? 2) }) : undefined}
            onclick={() => readAloud(s)}
          />
        </li>
      {/each}
    </ul>
  </section>
{:else}
  <p>{t('home.noProfile')}</p>
{/if}
<a class="switch" href="#/start">{t('home.switch')}</a>

<style>
  .hello {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin: var(--space-4) 0;
    padding: var(--space-3);
    border-radius: var(--radius-md);
    background: var(--color-teal);
    color: var(--color-ink);
  }
  .subjects {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }
  :global([data-grade-band='lower']) .subjects :global(.subject) {
    min-height: 168px;
  }
  .switch {
    display: inline-block;
    margin-top: var(--space-4);
    min-height: 48px;
    line-height: 48px;
    color: var(--color-ink);
    font-weight: var(--weight-strong);
  }
</style>
