import en from './en.json';
import id from './id.json';
import { i18nState, persistLocale, type Locale } from './state.svelte';

export type { Locale };
export type MessageKey = keyof typeof id;

const messages: Record<Locale, Record<MessageKey, string>> = { id, en };

document.documentElement.lang = i18nState.locale;

export function getLocale(): Locale {
  return i18nState.locale;
}

export function setLocale(locale: Locale): void {
  i18nState.locale = locale;
  document.documentElement.lang = locale;
  persistLocale(locale);
}

export function t(key: MessageKey, params: Record<string, string> = {}): string {
  const template = messages[i18nState.locale][key];
  return template.replace(/\{(\w+)\}/g, (_, name: string) => params[name] ?? `{${name}}`);
}
