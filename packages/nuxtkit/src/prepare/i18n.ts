import type { Nuxt } from '@nuxt/schema';
import type { NuxtI18nOptions } from '@nuxtjs/i18n';

import type { NuxtKitContext } from '../context';

/**
 * Detect optional Nuxt i18n integration.
 *
 * @returns Nuxt i18n options when available, otherwise `null`.
 */
export async function prepareI18n(context: NuxtKitContext, nuxt: Nuxt): Promise<NuxtI18nOptions | null> {
  const i18nModuleCandidates = ['@nuxtjs/i18n', '@nuxtjs/i18n-edge'];
  const modules = nuxt.options.modules || [];

  let i18nOptions: NuxtI18nOptions = {} as NuxtI18nOptions;

  const available = modules.some((module) => {
    // Case: string module declaration
    if (typeof module === 'string') {
      if (i18nModuleCandidates.includes(module)) {
        i18nOptions = (nuxt.options as any).i18n;
        return true;
      }
    }

    // Case: tuple module declaration (module + options)
    if (Array.isArray(module)) {
      const [moduleName, options] = module;
      if (i18nModuleCandidates.includes(moduleName as string)) {
        i18nOptions = options as NuxtI18nOptions;
        return true;
      }
    }

    return false;
  });

  if (!available) {
    context.logger.debug(`I18n integration disabled: no supported module found (${i18nModuleCandidates.join(' or ')})`);
    return null;
  }

  return i18nOptions;
}
