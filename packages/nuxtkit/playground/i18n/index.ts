import type { LocaleObject } from '@nuxtjs/i18n';

export const DEFAULT_LOCALE_CODE = 'en-GB' as const;

export const LOCALES = [
  {
    code: DEFAULT_LOCALE_CODE,
    dir: 'ltr',
    file: 'en-GB.json',
    isCatchallLocale: true,
    language: 'en-GB',
    name: 'English',
  },
  {
    code: 'sk',
    dir: 'ltr',
    file: 'sk.json',
    language: 'sk-SK',
    name: 'Slovenčina',
  },
  {
    code: 'cs',
    dir: 'ltr',
    file: 'cs.json',
    language: 'cs-CZ',
    name: 'Čeština',
  },
  {
    code: 'fr-FR',
    dir: 'ltr',
    file: 'fr-FR.json',
    language: 'fr-FR',
    name: 'French',
  },
] satisfies LocaleObject[];
