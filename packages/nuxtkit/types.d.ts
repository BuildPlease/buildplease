import '@nuxtjs/i18n';
import '@nuxt/schema';
import 'nuxt/schema';

import type { NuxtI18nOptions } from '@nuxtjs/i18n';
import type { Composer } from 'vue-i18n';

type NuxtI18nPublicRuntimeConfig = {
  /**
   * Public runtime config provided by @nuxtjs/i18n.
   *
   * NuxtKit does not configure this value. It only reads it at runtime when
   * the consumer app has @nuxtjs/i18n installed.
   */
  i18n?: {
    /**
     * Runtime locales exposed by @nuxtjs/i18n.
     */
    locales?: NuxtI18nOptions['locales'];
  };
};

declare module '#app' {
  interface NuxtApp {
    $i18n: Composer;
  }
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig extends NuxtI18nPublicRuntimeConfig {}
}

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig extends NuxtI18nPublicRuntimeConfig {}
}

export {};
