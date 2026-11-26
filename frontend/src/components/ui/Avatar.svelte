<script lang="ts">
  import { avatarUrl, type AvatarId } from './avatars';

  // Nama avatar = nama diri (tidak diterjemahkan). Dekoratif jika nama sudah tampil di dekatnya.
  let {
    id,
    size = 72,
    decorative = false,
  }: { id: AvatarId; size?: number; decorative?: boolean } = $props();
</script>

<img src={avatarUrl(id)} width={size} alt={decorative ? '' : id} />
