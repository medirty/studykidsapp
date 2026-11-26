<script lang="ts">
  // label = nama progres (sudah lewat t()).
  let { value, max = 100, label }: { value: number; max?: number; label: string } = $props();
  const pct = $derived(Math.max(0, Math.min(100, (value / max) * 100)));
</script>

<div
  class="bar"
  role="progressbar"
  aria-label={label}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-valuenow={value}
>
  <div class="fill" style:width="{pct}%"></div>
</div>

<style>
  .bar {
    height: 16px;
    background: var(--color-line);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: var(--color-teal);
    transition: width var(--duration-base) var(--ease-out);
  }
</style>
