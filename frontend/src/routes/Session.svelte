<script lang="ts">
  import { answerText } from '../components/question/answerText';
  import QuestionView from '../components/question/QuestionView.svelte';
  import { loc } from '../components/question/text';
  import Button from '../components/ui/Button.svelte';
  import Kiko from '../components/ui/Kiko.svelte';
  import ProgressBar from '../components/ui/ProgressBar.svelte';
  import SpeakButton from '../components/ui/SpeakButton.svelte';
  import Stars from '../components/ui/Stars.svelte';
  import { loadGradeIndex, loadUnit } from '../engine/content';
  import { sessionXp, xpFor } from '../engine/mastery';
  import {
    answer as grade,
    currentQuestion,
    historiesAfter,
    isDone,
    startSession,
    type PracticedSkill,
    type SessionQuestion,
    type SessionState,
  } from '../engine/session';
  import type { Answer, Skill } from '../engine/types';
  import { t } from '../i18n';
  import { uuidV4 } from '../lib/uuid';
  import { api } from '../services/api';
  import type { Grade, ProgressEvent, SkillMastery, SubjectId } from '../services/types';
  import { profile } from '../stores/profile.svelte';

  type Phase = 'loading' | 'locked' | 'ask' | 'feedback' | 'summary';
  interface Verdict {
    correct: boolean;
    right: string | null;
    explain: string;
    xp: number;
  }
  interface Delta {
    title: string;
    diff: number;
  }

  let { params = {} }: { params?: { skillId?: string } } = $props();
  const me = $derived(profile.active);
  const skillId = $derived(params.skillId ?? '');
  const subject = $derived(skillId.split('.')[0] as SubjectId);

  let phase = $state<Phase>('loading');
  let run = $state.raw<SessionState | null>(null);
  let sq = $state.raw<SessionQuestion | null>(null);
  let given = $state.raw<Answer | null>(null);
  let verdict = $state<Verdict | null>(null);
  let saveFailed = $state(false);
  let summary = $state<{
    stars: number;
    xp: number;
    right: number;
    total: number;
    deltas: Delta[];
  } | null>(null);
  let events: ProgressEvent[] = [];
  let skills: Record<string, Skill> = {};
  let before: Record<string, number> = {};
  let shownAt = 0;

  /** Skills of the same subject & grade that the child has practiced (review pool, FR-5 rule 6). */
  async function loadPool(mainId: string, mastery: SkillMastery[]): Promise<PracticedSkill[]> {
    const [subj, g] = mainId.split('.');
    const index = await loadGradeIndex(subj as SubjectId, Number(g!.slice(1)) as Grade);
    const units = await Promise.all((index?.units ?? []).map((u) => loadUnit(u.id)));
    for (const s of units.flatMap((u) => u?.skills ?? [])) skills[s.id] = s;
    return mastery.flatMap((m) =>
      skills[m.skillId] ? [{ skill: skills[m.skillId]!, mastery: m }] : [],
    );
  }

  async function start() {
    if (!me) return;
    phase = 'loading';
    events = [];
    saveFailed = false;
    skills = {};
    const mastery = await api.listMastery(me.id);
    const others = await loadPool(skillId, mastery);
    const skill = skills[skillId];
    const unlocked = skill && (await loadUnit(skillId.split('.').slice(0, 3).join('.')));
    if (!skill || !unlocked) return (phase = 'locked');
    before = Object.fromEntries(mastery.map((m) => [m.skillId, m.mastery]));
    run = startSession({
      ...{ profileId: me.id, grade: me.grade, skill, others, now: new Date() },
      mastery: mastery.find((m) => m.skillId === skillId),
      histories: await api.listSkillHistory(me.id),
    });
    await save(() => api.saveSkillHistory(historiesAfter(run!)));
    next();
  }

  // Saving must never block learning: a failure shows a friendly note and the session goes on.
  async function save(write: () => Promise<void>) {
    try {
      await write();
    } catch {
      saveFailed = true;
    }
  }

  function next() {
    if (!run) return;
    if (isDone(run)) return void finish();
    sq = currentQuestion(run);
    given = null;
    shownAt = Date.now();
    phase = 'ask';
  }

  async function check() {
    if (!run || !sq || given === null) return;
    const skill = run.slots[run.index]!.skill;
    const r = grade(run, sq, given, Date.now() - shownAt, new Date(), uuidV4());
    run = r.state;
    events.push(r.event);
    verdict = {
      correct: r.correct,
      right: answerText(sq.question),
      explain: loc(sq.question.hint ?? skill.explain),
      xp: xpFor(r.event),
    };
    phase = 'feedback';
    await save(() => api.recordProgress(r.event));
    await save(() => api.saveSkillHistory(historiesAfter(r.state)));
  }

  async function finish() {
    if (!me) return;
    const after = await api.listMastery(me.id);
    const ids = [...new Set(events.map((e) => e.skillId))];
    summary = {
      stars: after.find((m) => m.skillId === skillId)?.stars ?? 0,
      xp: sessionXp(events),
      right: events.filter((e) => e.correct).length,
      total: events.length,
      deltas: ids.flatMap((id) => {
        const now = after.find((m) => m.skillId === id)?.mastery;
        const diff = now === undefined ? 0 : Math.round(now - (before[id] ?? 0));
        return skills[id] && diff !== 0 ? [{ title: loc(skills[id]!.title), diff }] : [];
      }),
    };
    phase = 'summary';
  }

  $effect(() => {
    if (me && skillId) void start();
  });
  const total = $derived(run?.slots.length ?? 0);
  const position = $derived(run ? (phase === 'ask' ? run.index + 1 : run.index) : 0);
</script>

{#if !me}
  <p>{t('home.noProfile')}</p>
  <a class="exit" href="#/start">{t('home.switch')}</a>
{:else if phase === 'loading'}
  <p role="status">{t('session.loading')}</p>
{:else if phase === 'locked'}
  <p role="status">{t('session.locked')}</p>
  <a class="exit" href="#/home">← {t('map.back')}</a>
{:else if phase === 'summary' && summary}
  <section class="panel ok" aria-labelledby="h-sum">
    <Kiko mood="senang" size={140} />
    <h1 id="h-sum">{t('session.done', { name: me.nickname })}</h1>
    <Stars value={summary.stars} />
    <p>
      <span class="badge">{t('session.xp', { n: String(summary.xp) })}</span>
      <span class="badge">
        {t('session.correctCount', { n: String(summary.right), max: String(summary.total) })}
      </span>
    </p>
  </section>
  {#if summary.deltas.length > 0}
    <section aria-labelledby="h-skills">
      <h2 id="h-skills">{t('session.skills')}</h2>
      <ul class="skills">
        {#each summary.deltas as d (d.title)}
          <li>
            <span>{d.title}</span>
            <span class="delta">
              {d.diff > 0 ? `▲ ${t('session.up')} +${d.diff}` : `▼ ${t('session.more')} ${d.diff}`}
            </span>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
  {#if saveFailed}<p role="alert">{t('session.saveFailed')}</p>{/if}
  <div class="actions">
    <a class="exit" href={`#/map/${subject}`}>{t('session.backToMap')}</a>
    <Button onclick={start}>{t('session.again')}</Button>
  </div>
{:else if run && sq}
  <header class="top">
    <a class="exit" href={`#/map/${subject}`} aria-label={t('session.leave')}>✕</a>
    <div class="progress">
      <span>{t('session.progress', { n: String(position), max: String(total) })}</span>
      <ProgressBar value={position} max={total} label={t('session.progressLabel')} />
    </div>
  </header>
  {#if phase === 'ask'}
    {#if sq.hint}<p class="hint" role="note">💡 {loc(sq.hint)}</p>{/if}
    {#key run.index}
      <QuestionView question={sq.question} onchange={(a) => (given = a)} />
    {/key}
    <div class="actions">
      <Button disabled={given === null} onclick={check}>{t('session.check')}</Button>
    </div>
  {:else if verdict}
    <section class="panel" class:ok={verdict.correct} aria-live="polite">
      <Kiko mood={verdict.correct ? 'senang' : 'semangat'} size={140} />
      <h1>{t(verdict.correct ? 'session.right' : 'session.almost')}</h1>
      {#if verdict.correct}
        <p><span class="badge">{t('session.xp', { n: String(verdict.xp) })}</span></p>
      {:else}
        {#if verdict.right}<p>{t('session.correctAnswer', { a: verdict.right })}</p>{/if}
        <h2>{t('session.explain')}</h2>
        <p>{verdict.explain}</p>
        <SpeakButton text={verdict.explain} />
      {/if}
    </section>
    {#if saveFailed}<p role="alert">{t('session.saveFailed')}</p>{/if}
    <div class="actions">
      <Button onclick={next}>{t('session.next')}</Button>
    </div>
  {/if}
{/if}

<style>
  .top {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }
  .progress {
    flex: 1;
    display: grid;
    gap: var(--space-1);
    font-size: var(--text-sm);
  }
  .exit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--tap-min);
    min-height: var(--tap-min);
    color: var(--color-ink);
    font-weight: var(--weight-strong);
  }
  .panel {
    display: grid;
    justify-items: center;
    gap: var(--space-2);
    padding: var(--space-4);
    border: 3px solid var(--color-ink);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    text-align: center;
  }
  .panel.ok {
    background: var(--color-sunny);
  }
  .panel h1,
  .panel h2 {
    margin: 0;
  }
  .badge {
    display: inline-block;
    padding: var(--space-1) var(--space-3);
    border: 2px solid var(--color-ink);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    font-weight: var(--weight-strong);
  }
  .hint {
    margin: 0 0 var(--space-3);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    background: var(--color-sunny);
    color: var(--color-ink);
  }
  .skills {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .skills li {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-line);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }
</style>
