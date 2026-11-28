<script lang="ts">
  import { loc } from '../components/question/text';
  import Button from '../components/ui/Button.svelte';
  import Icon from '../components/ui/Icon.svelte';
  import Modal from '../components/ui/Modal.svelte';
  import Stars from '../components/ui/Stars.svelte';
  import { subjectUrl } from '../components/ui/subjectArt';
  import { loadGradeIndex, loadUnit } from '../engine/content';
  import { buildMap, type MapIsland } from '../engine/map';
  import type { Unit } from '../engine/types';
  import { t, type MessageKey } from '../i18n';
  import { api } from '../services/api';
  import type { SubjectId } from '../services/types';
  import { entitlement } from '../stores/entitlement.svelte';
  import { profile } from '../stores/profile.svelte';
  import NotFound from './NotFound.svelte';

  const subjectIds: string[] = [
    'math',
    'english',
    'science',
    'gp',
    'wellbeing',
    'art',
    'music',
    'computing',
  ];
  let { params = {} }: { params?: { subject?: string } } = $props();

  const subject = $derived(params.subject as SubjectId);
  const me = $derived(profile.active);
  type View = 'loading' | 'subjectLocked' | 'soon' | 'ready';
  let view = $state<View>('loading');
  let islands = $state<MapIsland[]>([]);
  let showUnlock = $state(false);

  async function load(s: SubjectId, grade: 1 | 2 | 3 | 4 | 5 | 6, profileId: string) {
    view = 'loading';
    const [pub] = await Promise.all([api.getPublicSettings(), entitlement.load()]);
    const full = entitlement.isFull;
    if (!full && !pub.demo.subjects.includes(s)) return (view = 'subjectLocked');
    const index = await loadGradeIndex(s, grade);
    if (!index) return (view = 'soon');
    const units: Record<string, Unit | null> = {};
    const limit = full ? index.units.length : entitlement.unitLimit;
    await Promise.all(
      index.units.slice(0, limit).map(async (u) => (units[u.id] = await loadUnit(u.id))),
    );
    const mastery = await api.listMastery(profileId);
    islands = buildMap(index, units, mastery, { unitLimit: entitlement.unitLimit, full });
    view = 'ready';
  }

  $effect(() => {
    if (me && subjectIds.includes(subject)) void load(subject, me.grade, me.id);
  });
  const firstLocked = $derived(islands.findIndex((i) => i.locked));
</script>

{#if !subjectIds.includes(subject)}
  <NotFound />
{:else if !me}
  <p>{t('home.noProfile')}</p>
  <a class="back" href="#/start">{t('home.switch')}</a>
{:else}
  <section class="band" aria-labelledby="h-map">
    <a class="back" href="#/home">← {t('map.back')}</a>
    <h1 id="h-map">
      {t(`subject.${subject}` as MessageKey)} · {t('start.gradeN', { n: String(me.grade) })}
    </h1>
    <p>{t('map.intro')}</p>
  </section>

  {#if view === 'loading'}
    <p role="status">{t('map.loading')}</p>
  {:else if view === 'subjectLocked'}
    <p><Icon name="lock" size={20} /> {t('map.subjectLocked')}</p>
    <Button onclick={() => (showUnlock = true)}>{t('map.unlock')}</Button>
  {:else if view === 'soon'}
    <p role="status">{t('map.soon')}</p>
  {:else}
    <ul class="legend" aria-label={t('map.legend')}>
      <li><Icon name="star" size={16} /> {t('map.done')}</li>
      <li><span aria-hidden="true">▶</span> {t('map.open')}</li>
      <li><Icon name="lock" size={16} /> {t('ui.locked')}</li>
    </ul>
    {#each islands as island, i (island.id)}
      {#if !island.locked}
        <section
          class="island"
          style:--sc="var(--subject-{subject})"
          aria-labelledby={`h-${island.id}`}
        >
          <h2 id={`h-${island.id}`}>
            <img src={subjectUrl(subject)} alt="" width="40" height="40" />
            {t('map.island', { n: String(i + 1), title: loc(island.title) })}
          </h2>
          <ol class="trail">
            {#each island.skills as s (s.id)}
              <li>
                {#if s.status === 'locked'}
                  <div class="stop lock">
                    <span class="dot"><Icon name="lock" size={22} /></span>
                    <span>
                      <span class="name">{loc(s.title)}</span>
                      <small>{t('map.locked')}</small>
                    </span>
                  </div>
                {:else}
                  <a class="stop" class:open={s.status === 'open'} href={`#/session/${s.id}`}>
                    <span class="dot" aria-hidden="true">{s.status === 'done' ? '✓' : '▶'}</span>
                    <span>
                      <span class="name">{loc(s.title)}</span>
                      <small>
                        {t(s.status === 'done' ? 'map.done' : 'map.open')}
                        {#if s.stars > 0}<Stars value={s.stars} />{/if}
                      </small>
                    </span>
                  </a>
                {/if}
              </li>
            {/each}
          </ol>
          {#if island.complete}
            <p class="chest">{t('map.chest', { n: String(i + 1) })}</p>
          {/if}
        </section>
      {/if}
    {/each}
    {#if firstLocked >= 0}
      <section class="island more" aria-labelledby="h-more">
        <h2 id="h-more">
          <Icon name="lock" size={24} />
          {t('map.more', { n: String(firstLocked + 1) })}
        </h2>
        <p>{t('map.moreBody')}</p>
        <Button onclick={() => (showUnlock = true)}>{t('map.unlock')}</Button>
      </section>
    {/if}
  {/if}
  {#if showUnlock}
    <Modal title={t('map.unlockTitle')} onclose={() => (showUnlock = false)}>
      <p>{t('map.unlockBody')}</p>
    </Modal>
  {/if}
{/if}

<style>
  .band {
    padding: var(--space-3);
    border-radius: var(--radius-md);
    background: var(--color-sunny);
    color: var(--color-ink);
  }
  .band h1 {
    margin: var(--space-2) 0 0;
  }
  .back {
    display: inline-block;
    min-height: var(--tap-min);
    line-height: var(--tap-min);
    color: var(--color-ink);
    font-weight: var(--weight-strong);
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
    margin: var(--space-3) 0;
    padding: 0;
    list-style: none;
    font-size: var(--text-sm);
  }
  .island {
    margin: var(--space-4) 0;
    padding: var(--space-4);
    border: 3px solid var(--color-ink);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: 0 4px 0 var(--color-ink);
  }
  .island h2 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0 0 var(--space-3);
    font-size: var(--text-lg);
  }
  .island h2 img {
    padding: 4px;
    border-radius: var(--radius-sm);
    background: var(--sc);
  }
  .more {
    border-style: dashed;
    box-shadow: none;
    background: var(--color-bg);
  }
  .trail {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .trail::before {
    content: '';
    position: absolute;
    top: 24px;
    bottom: 24px;
    left: 50%;
    border-left: 4px dotted var(--color-line);
  }
  .stop {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 82%;
    min-height: 72px;
    padding: var(--space-2) var(--space-3);
    border: 3px solid var(--color-ink);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-ink);
    text-decoration: none;
  }
  .trail > li:nth-child(odd) .stop {
    margin-right: auto;
  }
  .trail > li:nth-child(even) .stop {
    margin-left: auto;
  }
  .stop:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-offset);
  }
  .stop.open {
    background: var(--color-sunny);
    box-shadow: 0 4px 0 var(--color-ink);
  }
  .stop.lock {
    border-style: dashed;
    background: var(--color-bg);
  }
  .dot {
    flex: none;
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border: 3px solid var(--color-ink);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    font: var(--weight-heading) var(--text-lg) var(--font-heading);
  }
  .lock .dot {
    border-style: dashed;
  }
  .name {
    display: block;
    font: var(--weight-heading) var(--text-md) var(--font-heading);
    line-height: var(--leading-tight);
  }
  small {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-xs);
  }
  .chest {
    margin: var(--space-3) 0 0;
    font-weight: var(--weight-strong);
  }
</style>
