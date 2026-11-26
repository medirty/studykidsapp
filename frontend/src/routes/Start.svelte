<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { t } from '../i18n';
  import { avatarIds, type AvatarId } from '../components/ui/avatars';
  import Avatar from '../components/ui/Avatar.svelte';
  import Button from '../components/ui/Button.svelte';
  import { profile } from '../stores/profile.svelte';
  import { settings } from '../stores/settings.svelte';
  import type { Grade } from '../services/types';

  const grades: Grade[] = [1, 2, 3, 4, 5, 6];
  let grade = $state<Grade | null>(null);
  let nickname = $state('');
  let avatarId = $state<AvatarId>('pipo');
  let error = $state(false);

  async function pick(id: string) {
    await profile.select(id);
    await push('/home');
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    const name = nickname.trim();
    if (!grade || name.length < 1 || name.length > 20) {
      error = true;
      return;
    }
    error = false;
    await profile.create({ nickname: name, grade, avatarId, locale: settings.locale });
    await push('/home');
  }
</script>

<h1>{t('start.title')}</h1>

{#if profile.list.length}
  <section aria-labelledby="h-prof">
    <h2 id="h-prof">{t('start.profiles')}</h2>
    <ul class="profiles">
      {#each profile.list as p (p.id)}
        <li>
          <button type="button" class="prof" onclick={() => pick(p.id)}>
            <Avatar id={p.avatarId as AvatarId} size={56} decorative />
            <span>{p.nickname}<small>{t('start.gradeN', { n: String(p.grade) })}</small></span>
          </button>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<form onsubmit={submit} aria-labelledby="h-new">
  <h2 id="h-new">{t('start.new')}</h2>

  <fieldset>
    <legend>{t('start.grade')}</legend>
    <div class="grades">
      {#each grades as g (g)}
        <label class:on={grade === g}>
          <input type="radio" name="grade" value={g} bind:group={grade} />
          {t('start.gradeN', { n: String(g) })}
        </label>
      {/each}
    </div>
  </fieldset>

  <label class="field">
    {t('start.nickname')}
    <input type="text" maxlength="20" autocomplete="off" bind:value={nickname} />
    <small>{t('start.nicknameHint')}</small>
  </label>

  <fieldset>
    <legend>{t('start.avatar')}</legend>
    <div class="avatars">
      {#each avatarIds as id (id)}
        <label class:on={avatarId === id}>
          <input type="radio" name="avatar" value={id} bind:group={avatarId} />
          <Avatar {id} size={56} />
        </label>
      {/each}
    </div>
  </fieldset>

  {#if error}<p role="alert">{t('start.error')}</p>{/if}
  <Button type="submit" large>{t('start.go')}</Button>
</form>

<style>
  form,
  section {
    display: grid;
    gap: var(--space-4);
    margin-top: var(--space-4);
  }
  fieldset {
    border: 0;
    padding: 0;
    margin: 0;
  }
  legend,
  .field {
    font: var(--weight-strong) var(--text-base) var(--font-body);
  }
  .profiles {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--space-2);
  }
  .prof,
  .grades label,
  .avatars label {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-height: 56px;
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface);
    border: 2px solid var(--color-line);
    border-radius: var(--radius-md);
    color: var(--color-ink);
    cursor: pointer;
    font: var(--weight-strong) var(--text-base) var(--font-body);
  }
  .prof {
    width: 100%;
    text-align: left;
  }
  small {
    display: block;
    font-weight: normal;
    color: var(--color-ink-soft);
  }
  .grades,
  .avatars {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-2);
  }
  .grades label,
  .avatars label {
    justify-content: center;
    position: relative;
  }
  .on {
    border: 3px solid var(--color-ink);
  }
  input[type='radio'] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  label:has(input:focus-visible),
  .prof:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-offset);
  }
  input[type='text'] {
    display: block;
    width: 100%;
    box-sizing: border-box;
    min-height: 56px;
    margin-top: var(--space-1);
    padding: var(--space-2) var(--space-3);
    border: 2px solid var(--color-ink);
    border-radius: var(--radius-md);
    font: var(--text-lg) var(--font-body);
  }
  [role='alert'] {
    font-weight: var(--weight-strong);
  }
</style>
