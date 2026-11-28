<script lang="ts">
  import type { QuestionOf } from '../../engine/types';
  import { t } from '../../i18n';
  import Button from '../ui/Button.svelte';
  import QuestionPrompt from './QuestionPrompt.svelte';

  let {
    question,
    disabled = false,
    onchange,
  }: {
    question: QuestionOf<'draw'>;
    disabled?: boolean;
    onchange: (a: 'done' | null) => void;
  } = $props();
  let canvas: HTMLCanvasElement;
  let drawing = false;

  // Tidak dinilai (FR-5): "Selesai" selalu boleh. Warna garis dari token lewat CSS `color`.
  const ctx = () => canvas.getContext('2d');
  function point(e: PointerEvent): [number, number] {
    const r = canvas.getBoundingClientRect();
    return [
      ((e.clientX - r.left) * canvas.width) / r.width,
      ((e.clientY - r.top) * canvas.height) / r.height,
    ];
  }
  function down(e: PointerEvent) {
    const c = ctx();
    if (disabled || !c) return;
    drawing = true;
    canvas.setPointerCapture?.(e.pointerId);
    c.strokeStyle = getComputedStyle(canvas).color;
    c.lineWidth = 6;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(...point(e));
  }
  function move(e: PointerEvent) {
    const c = ctx();
    if (!drawing || !c) return;
    c.lineTo(...point(e));
    c.stroke();
  }
  function clear() {
    ctx()?.clearRect(0, 0, canvas.width, canvas.height);
  }
</script>

<div class="stack">
  <QuestionPrompt prompt={question.prompt} />
  <canvas
    bind:this={canvas}
    width="640"
    height="480"
    aria-label={t('q.canvas')}
    onpointerdown={down}
    onpointermove={move}
    onpointerup={() => (drawing = false)}
    onpointercancel={() => (drawing = false)}
  ></canvas>
  <div class="actions">
    <Button variant="secondary" {disabled} onclick={clear}>{t('q.clear')}</Button>
    <Button {disabled} onclick={() => onchange('done')}>{t('q.done')}</Button>
  </div>
</div>

<style>
  .stack {
    display: grid;
    gap: var(--space-4);
  }
  canvas {
    width: 100%;
    aspect-ratio: 4 / 3;
    border: 2px solid var(--color-line);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-ink);
    touch-action: none;
  }
  .actions {
    display: flex;
    gap: var(--space-3);
  }
</style>
