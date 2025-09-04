import type { NuxtKitOptions } from './types';

export const NUXT_MODULE_ID = '@meowv/nuxtkit';
export const NUXT_CONFIG_KEY = 'meowvNuxtKit';

export const DEFAULT_OPTIONS = {
  unauthorizedStatusCodes: [401],
} as const satisfies NuxtKitOptions;
