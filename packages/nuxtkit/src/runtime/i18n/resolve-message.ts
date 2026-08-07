import type { Composer } from 'vue-i18n';

export function resolveI18nMessage(i18n: Composer, key: string, fallback: string): string {
  return i18n.te(key) ? i18n.t(key) : fallback;
}
