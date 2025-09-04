import { Container } from 'inversify';

import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin({
  name: 'nuxtkit:plugin',
  setup(_nuxtApp) {
    const container = new Container();

    return {
      provide: {
        container,
        getInstance: <T>(id: symbol): T => container.get<T>(id),
      },
    };
  },
});
