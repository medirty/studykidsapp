// Learning map model (FR-4): units = islands, skills = stops. Pure; the UI loads the data.
import type { SkillMastery } from '../services/types';
import type { GradeIndex, LocalizedText, Unit } from './types';

export type StopStatus = 'done' | 'open' | 'locked';

export interface MapStop {
  id: string;
  title: LocalizedText;
  stars: number; // 0–3
  status: StopStatus;
}

export interface MapIsland {
  id: string;
  title: LocalizedText;
  locked: boolean; // beyond the demo limit, or the unit file is not bundled
  complete: boolean; // every skill has ≥ 1 star
  skills: MapStop[]; // empty when locked
}

/** A skill opens once the one before it has ≥ 1 star; the first of an open unit is always open. */
function stops(unit: Unit, stars: Map<string, number>): MapStop[] {
  return unit.skills.map((s, i) => {
    const n = stars.get(s.id) ?? 0;
    const prev = i === 0 ? 1 : (stars.get(unit.skills[i - 1]!.id) ?? 0);
    const status: StopStatus = n >= 1 ? 'done' : prev >= 1 ? 'open' : 'locked';
    return { id: s.id, title: s.title, stars: n, status };
  });
}

/** `units[id]` = loaded unit, or null/missing when its file is not bundled (FR-10). */
export function buildMap(
  index: GradeIndex,
  units: Record<string, Unit | null | undefined>,
  mastery: SkillMastery[],
  access: { unitLimit: number; full: boolean },
): MapIsland[] {
  const stars = new Map(mastery.map((m) => [m.skillId, m.stars]));
  return index.units.map((u, i) => {
    const unit = units[u.id];
    if (!unit || (!access.full && i >= access.unitLimit)) {
      return { id: u.id, title: u.title, locked: true, complete: false, skills: [] };
    }
    const skills = stops(unit, stars);
    return {
      id: u.id,
      title: u.title,
      locked: false,
      complete: skills.every((s) => s.stars >= 1),
      skills,
    };
  });
}
