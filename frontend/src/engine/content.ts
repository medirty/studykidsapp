// Content loader (ADR D-014 i): one lazy chunk per JSON file; a missing unit file = locked unit.
import type { Grade, SubjectId } from '../services/types';
import type { GradeIndex, Unit } from './types';

const units = import.meta.glob<Unit>('../content/*/g*/u*.json', { import: 'default' });
const indexes = import.meta.glob<GradeIndex>('../content/*/g*/index.json', { import: 'default' });

/** `math.g1.u2` → unit, or null when the unit is locked (not bundled) or unknown. */
export async function loadUnit(id: string): Promise<Unit | null> {
  const [subject, grade, unit] = id.split('.');
  const load = units[`../content/${subject}/${grade}/${unit}.json`];
  return load ? load() : null;
}

export async function loadGradeIndex(subject: SubjectId, grade: Grade): Promise<GradeIndex | null> {
  const load = indexes[`../content/${subject}/g${grade}/index.json`];
  return load ? load() : null;
}
