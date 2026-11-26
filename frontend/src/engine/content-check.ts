// Content schema checks (ADR D-014 a, i). Used by tests only: content is bundled at build time, not user input.
import type { SubjectId } from '../services/types';
import { getGenerator } from './generators/registry';
import type { BankItem, GeneratorRef, GradeIndex, Skill, Unit } from './types';

type Errors = string[];
const PATH = /content\/([a-z]+)\/g(\d+)\/(?:u(\d+)|index)\.json$/;

function parsePath(path: string) {
  const m = PATH.exec(path);
  if (!m) return null;
  const [, subject = '', grade = '', unit] = m;
  return { subject, gradeId: `${subject}.g${grade}`, unit: unit ? Number(unit) : null };
}

const badPath = (path: string) => [
  `${path}: path is not content/{subject}/g{grade}/u{n}|index.json`,
];

function isText(t: unknown): boolean {
  const o = t as { id?: unknown; en?: unknown } | null;
  const ok = (s: unknown) => typeof s === 'string' && s.trim() !== '';
  return typeof o === 'object' && o !== null && ok(o.id) && ok(o.en);
}

const text = (owner: string, field: string, t: unknown): Errors =>
  isText(t) ? [] : [`${owner}: ${field} needs non-empty id + en`];

/** `child` must be `${parent}${sep}<n>`. */
const childId = (child: string, parent: string, sep: string) =>
  child.startsWith(parent + sep) && /^\d+$/.test(child.slice(parent.length + sep.length));

function checkBank(params: Record<string, unknown>, formats: string[], skillId: string): Errors {
  const items = params.items as BankItem[] | undefined;
  if (!Array.isArray(items)) return [`${skillId}: bank needs params.items`];
  const seen = new Set<string>();
  const errors = items.flatMap((item) => {
    const e = seen.has(item.id) ? [`${skillId}: duplicate item id "${item.id}"`] : [];
    seen.add(item.id);
    e.push(...text(`${skillId} item ${item.id}`, 'prompt', item.prompt));
    if (!formats.includes(item.format)) {
      e.push(`${skillId} item ${item.id}: format ${item.format} not in ref formats`);
    }
    return e;
  });
  const missing = formats.filter((f) => !items.some((i) => i.format === f));
  return [...errors, ...missing.map((f) => `${skillId}: no bank item for format ${f}`)];
}

function checkRef(ref: GeneratorRef, skillId: string): Errors {
  let supported: readonly string[];
  try {
    supported = getGenerator(ref.type).formats;
  } catch {
    return [`${skillId}: unknown generator "${ref.type}"`];
  }
  if (ref.formats.length === 0) return [`${skillId}: ${ref.type} needs ≥ 1 format`];
  const errors = ref.formats
    .filter((f) => !supported.includes(f))
    .map((f) => `${skillId}: ${ref.type} does not support format ${f}`);
  return ref.type === 'bank' ? [...errors, ...checkBank(ref.params, ref.formats, skillId)] : errors;
}

function checkSkill(skill: Skill, unitId: string): Errors {
  const errors = childId(skill.id, unitId, '.s')
    ? []
    : [`${skill.id}: skill id must be ${unitId}.s<n>`];
  errors.push(...text(skill.id, 'title', skill.title), ...text(skill.id, 'explain', skill.explain));
  if (skill.generators.length === 0) errors.push(`${skill.id}: needs ≥ 1 generator`);
  return [...errors, ...skill.generators.flatMap((ref) => checkRef(ref, skill.id))];
}

export function checkUnit(unit: Unit, path: string): Errors {
  const p = parsePath(path);
  if (!p || p.unit === null) return badPath(path);
  const expected = `${p.gradeId}.u${p.unit}`;
  const errors = unit.id === expected ? [] : [`${path}: id "${unit.id}" must be "${expected}"`];
  errors.push(...text(unit.id, 'title', unit.title));
  if (unit.skills.length < 3) errors.push(`${unit.id}: needs ≥ 3 skills (§6.5)`);
  return [...errors, ...unit.skills.flatMap((s) => checkSkill(s, unit.id))];
}

export function checkIndex(index: GradeIndex, path: string): Errors {
  const p = parsePath(path);
  if (!p || p.unit !== null) return badPath(path);
  const errors = index.id === p.gradeId ? [] : [`${path}: id "${index.id}" must be "${p.gradeId}"`];
  const seen = new Set<string>();
  for (const u of index.units) {
    if (!childId(u.id, index.id, '.u')) errors.push(`${u.id}: unit id must be ${index.id}.u<n>`);
    if (seen.has(u.id)) errors.push(`${path}: duplicate unit "${u.id}"`);
    seen.add(u.id);
    errors.push(...text(u.id, 'title', u.title));
  }
  return errors;
}

/** Cross-file rules: FR-10 (demo units only), every unit in its index, skill ids unique. */
export function checkContentSet(
  units: Record<string, Unit>,
  indexes: Record<string, GradeIndex>,
  demo: { subjects: SubjectId[]; unitLimit: number },
): Errors {
  const errors: Errors = [];
  const skills = new Set<string>();
  for (const [path, unit] of Object.entries(units)) {
    const p = parsePath(path);
    if (!p || p.unit === null) continue; // reported by checkUnit
    if (!demo.subjects.includes(p.subject as SubjectId)) {
      errors.push(`${path}: subject ${p.subject} is not a demo subject (FR-10)`);
    }
    if (p.unit > demo.unitLimit)
      errors.push(`${path}: u${p.unit} > demo unitLimit ${demo.unitLimit} (FR-10)`);
    const index = indexes[path.replace(/u\d+\.json$/, 'index.json')];
    if (!index?.units.some((u) => u.id === unit.id))
      errors.push(`${unit.id}: not listed in index.json`);
    for (const s of unit.skills) {
      if (skills.has(s.id)) errors.push(`duplicate skill id "${s.id}"`);
      skills.add(s.id);
    }
  }
  return errors;
}
