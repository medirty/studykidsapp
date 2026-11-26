import type { Locale } from '../i18n';

export type SpeakResult = 'ok' | 'fallback' | 'unsupported';

export const speechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

export const recognitionSupported = (): boolean =>
  typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

const LANG_PREFIX: Record<Locale, string> = { id: 'id', en: 'en' };

// en: utamakan en-US lalu en-GB (PRD FR-8). Mengembalikan undefined jika tak ada yang cocok.
export function pickVoice(
  voices: SpeechSynthesisVoice[],
  locale: Locale,
): SpeechSynthesisVoice | undefined {
  const prefix = LANG_PREFIX[locale];
  const norm = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().replace('_', '-');
  const matches = voices.filter((v) => norm(v).split('-')[0] === prefix);
  return (
    matches.find((v) => norm(v) === 'en-us') ??
    matches.find((v) => norm(v) === 'en-gb') ??
    matches[0]
  );
}

export function speak(text: string, locale: Locale): SpeakResult {
  if (!speechSupported()) return 'unsupported';
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const voice = pickVoice(voices, locale);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice?.lang ?? (locale === 'id' ? 'id-ID' : 'en-US');
  if (voice) utterance.voice = voice;
  synth.cancel();
  synth.speak(utterance);
  // Daftar suara kosong = belum dimuat (umum di Chrome), bukan bukti suara tak ada.
  return voices.length > 0 && !voice ? 'fallback' : 'ok';
}
