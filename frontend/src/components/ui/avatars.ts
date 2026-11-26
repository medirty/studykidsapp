const files = import.meta.glob('../../assets/avatar/avatar-*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export const avatarIds = [
  'pipo',
  'luna',
  'bima',
  'momo',
  'kira',
  'rafi',
  'nala',
  'dito',
  'sari',
  'tiko',
  'mira',
  'zuzu',
] as const;
export type AvatarId = (typeof avatarIds)[number];

export function avatarUrl(id: AvatarId): string {
  return files[`../../assets/avatar/avatar-${id}.svg`] ?? '';
}
