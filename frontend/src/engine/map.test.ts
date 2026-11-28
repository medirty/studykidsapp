import { describe, expect, it } from 'vitest';
import type { SkillMastery } from '../services/types';
import { buildMap } from './map';
import type { GradeIndex, Unit } from './types';

const title = (s: string) => ({ id: s, en: s });
const unit = (n: number, skills: number): Unit => ({
  id: `math.g1.u${n}`,
  title: title(`U${n}`),
  skills: Array.from({ length: skills }, (_, i) => ({
    id: `math.g1.u${n}.s${i + 1}`,
    title: title(`S${i + 1}`),
    generators: [],
    explain: title('e'),
  })),
});
const index: GradeIndex = {
  id: 'math.g1',
  units: [1, 2, 3].map((n) => ({ id: `math.g1.u${n}`, title: title(`U${n}`) })),
};
const units = { 'math.g1.u1': unit(1, 3), 'math.g1.u2': unit(2, 3), 'math.g1.u3': null };
const star = (skillId: string, stars: number): SkillMastery => ({
  profileId: 'p',
  skillId,
  mastery: 50,
  attempts: 10,
  stars,
  lastPracticedAt: '2026-11-28T00:00:00.000Z',
});
const demo = { unitLimit: 2, full: false };

describe('buildMap', () => {
  it('skill pertama terbuka, sisanya terkunci sampai yang sebelumnya berbintang', () => {
    const [u1] = buildMap(index, units, [], demo);
    expect(u1!.skills.map((s) => s.status)).toEqual(['open', 'locked', 'locked']);
  });

  it('bintang ≥ 1 = selesai dan membuka skill berikutnya; bintang ikut tampil', () => {
    const [u1] = buildMap(index, units, [star('math.g1.u1.s1', 3), star('math.g1.u1.s2', 1)], demo);
    expect(u1!.skills.map((s) => [s.status, s.stars])).toEqual([
      ['done', 3],
      ['done', 1],
      ['open', 0],
    ]);
    expect(u1!.complete).toBe(false);
  });

  it('pulau tuntas bila semua skill berbintang', () => {
    const m = ['s1', 's2', 's3'].map((s) => star(`math.g1.u1.${s}`, 1));
    expect(buildMap(index, units, m, demo)[0]!.complete).toBe(true);
  });

  it('demo: unit di luar batas terkunci walau filenya ada', () => {
    const all = { ...units, 'math.g1.u3': unit(3, 3) };
    const islands = buildMap(index, all, [], demo);
    expect(islands.map((i) => i.locked)).toEqual([false, false, true]);
    expect(islands[2]!.skills).toEqual([]);
  });

  it('Full: unit di atas batas terbuka bila filenya ada; tanpa file tetap terkunci', () => {
    const full = { unitLimit: 2, full: true };
    expect(buildMap(index, { ...units, 'math.g1.u3': unit(3, 3) }, [], full)[2]!.locked).toBe(
      false,
    );
    expect(buildMap(index, units, [], full)[2]!.locked).toBe(true);
  });
});
