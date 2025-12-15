import { useNuxtApp } from '#app';

/**
 * Determines if the app is running in SSR mode.
 */
export const isSSR: boolean = import.meta.server;

/**
 * Determines if the app is running in CSR mode.
 */
export const isCSR: boolean = import.meta.client;

/**
 * Determines if the app is in development mode.
 */
export const isDev: boolean = import.meta.dev;

/**
 * Checks if the app is currently hydrating.
 */
export const isHydrating = (): boolean => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.isHydrating ?? false;
};
