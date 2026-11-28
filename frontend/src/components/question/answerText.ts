// The correct answer as readable text for the feedback panel; null = nothing to show (draw is not graded).
import type { Choice, Question } from '../../engine/types';
import { t } from '../../i18n';
import { choiceLabel } from './text';

const label = (list: Choice[], id: string) => {
  const c = list.find((x) => x.id === id);
  return c ? choiceLabel(c) || id : id;
};

export function answerText(q: Question): string | null {
  switch (q.format) {
    case 'mcq':
    case 'listen':
      return label(q.choices, q.answer);
    case 'tap':
      return q.answer.map((id) => label(q.choices, id)).join(', ');
    case 'tf':
      return t(q.answer ? 'q.true' : 'q.false');
    case 'input':
      return q.answer;
    case 'order':
      return q.answer.map((id) => label(q.items, id)).join(' → ');
    case 'match':
      return Object.entries(q.answer)
        .map(([l, r]) => `${label(q.left, l)} – ${label(q.right, r)}`)
        .join(', ');
    case 'dragdrop':
      return Object.entries(q.answer)
        .map(([i, g]) => `${label(q.items, i)} → ${label(q.targets, g)}`)
        .join(', ');
    case 'draw':
      return null;
  }
}
