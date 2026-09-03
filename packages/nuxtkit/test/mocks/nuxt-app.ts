import type { ScopeController } from '@buildplease/core';

interface TestI18n {
  te(key: string): boolean;
  t(key: string): string;
}

interface TestNuxtApp {
  readonly $i18n: TestI18n;
  readonly $scopeController?: ScopeController;
}

const DEFAULT_I18N: TestI18n = {
  te: () => false,
  t: (key) => key,
};

let app: TestNuxtApp = {
  $i18n: DEFAULT_I18N,
};

export function useNuxtApp(): TestNuxtApp {
  return app;
}

export function setNuxtApp(input: { $i18n?: TestI18n; $scopeController?: ScopeController }): void {
  app = {
    $i18n: input.$i18n ?? DEFAULT_I18N,
    $scopeController: input.$scopeController,
  };
}

export function resetNuxtApp(): void {
  app = {
    $i18n: DEFAULT_I18N,
  };
}

export function defineNuxtPlugin<T>(plugin: T): T {
  return plugin;
}
