import type { Choice, LocalizedText } from '../../engine/types';
import { getLocale } from '../../i18n';

export const loc = (text: LocalizedText | undefined): string => text?.[getLocale()] ?? '';
// shortcut: gambar (`Choice.image`) belum ditampilkan, resolver AssetKey menyusul bersama konten (T3.16).
export const choiceLabel = (c: Choice): string => loc(c.text);
