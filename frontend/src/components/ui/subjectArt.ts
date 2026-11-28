import type { SubjectId } from '../../services/types';

// ?url = file terpisah (di-cache browser), tidak masuk JS awal.
const files = import.meta.glob('../../assets/subject/subject-*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export const subjectUrl = (id: SubjectId): string =>
  files[`../../assets/subject/subject-${id}.svg`] ?? '';
