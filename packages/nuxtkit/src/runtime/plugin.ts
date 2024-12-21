import { Container } from 'inversify';

import type { Plugin } from 'nuxt/app';

import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin(() => {
  const container = new Container();

  return {
    provide: {
      container: container,
      getInstance: <T>(serviceIdentifier: symbol): T => {
        return container.get<T>(serviceIdentifier);
      },
    },
  };
}) as Plugin<{
  container: Container;
  getInstance: <T>(serviceIdentifier: symbol) => T;
}>;
