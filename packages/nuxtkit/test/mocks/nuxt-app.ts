export function useNuxtApp() {
  return {
    $i18n: {},
  };
}

export function defineNuxtPlugin<T>(plugin: T): T {
  return plugin;
}
