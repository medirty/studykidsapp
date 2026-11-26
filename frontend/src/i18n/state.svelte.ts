export type Locale = 'id' | 'en';

const STORAGE_KEY = 'sk.locale';

function readStored(): Locale {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'id';
  } catch {
    return 'id';
  }
}

export const i18nState = $state<{ locale: Locale }>({ locale: readStored() });

export function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // shortcut: storage diblokir → locale tidak tersimpan; pindah ke profil di T2.7
  }
}
