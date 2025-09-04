import type { Composer } from 'vue-i18n';

declare module '#app' {
  interface NuxtApp {
    $i18n: Composer;
  }
}

export {};
