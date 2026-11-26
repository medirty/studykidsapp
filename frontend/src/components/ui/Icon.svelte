<script lang="ts">
  import { iconPaths, type IconName } from './icons';

  // label kosong = dekoratif (aria-hidden); isi label (sudah lewat t()) jika ikon bermakna sendiri.
  let { name, label = '', size = 24 }: { name: IconName; label?: string; size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  role={label ? 'img' : undefined}
  aria-label={label || undefined}
  aria-hidden={label ? undefined : 'true'}
>
  <path d={iconPaths[name]} />
</svg>
