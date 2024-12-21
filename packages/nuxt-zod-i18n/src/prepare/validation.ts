import type { Nuxt } from '@nuxt/schema';
import type { NuxtI18nOptions } from '@nuxtjs/i18n';

import type { Zodi18nNuxtContext } from '../context';

/**
 * Validates required dependencies and Nuxt version.
 * Throws errors if validation fails.
 * @returns NuxtI18nOptions.
 */
export function prepareValidation(
  { logger }: Zodi18nNuxtContext,
  nuxt: Nuxt,
): NuxtI18nOptions {
  let i18nOptions: NuxtI18nOptions = {} as NuxtI18nOptions;

  // Check if @nuxtjs/i18n is installed
  const i18nAvailable = nuxt.options.modules.some((module) => {
    const i18nModuleNames = ['@nuxtjs/i18n', '@nuxtjs/i18n-edge'];

    // Case: String module declaration
    if (typeof module === 'string') {
      if (i18nModuleNames.includes(module)) {
        i18nOptions = (nuxt.options as any).i18n;
        return true;
      }
    }

    // Case: Tuple module declaration (module + options)
    if (Array.isArray(module)) {
      const [moduleName, options] = module;
      if (i18nModuleNames.includes(moduleName as string)) {
        i18nOptions = options as NuxtI18nOptions;
        return true;
      }
    }

    return false;
  });

  // Handle missing @nuxtjs/i18n module
  if (!i18nAvailable) {
    logger.fatal('Nuxt I18n module is required. Please install @nuxtjs/i18n.');
  }

  // Validate Nuxt version
  if (!nuxt.options._majorVersion || nuxt.options._majorVersion < 3) {
    logger.fatal('Nuxt 3 or later is required.');
  }

  return i18nOptions;
}
