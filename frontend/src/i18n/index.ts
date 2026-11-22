import en from './en.json';
import id from './id.json';

export type Locale = 'id' | 'en';
export type MessageKey = keyof typeof id;

const messages: Record<Locale, Record<MessageKey, string>> = { id, en };

let current: Locale = 'id';

export function setLocale(locale: Locale): void {
  current = locale;
  document.documentElement.lang = locale;
}

export function t(key: MessageKey, params: Record<string, string> = {}): string {
  const template = messages[current][key];
  return template.replace(/\{(\w+)\}/g, (_, name: string) => params[name] ?? `{${name}}`);
}
