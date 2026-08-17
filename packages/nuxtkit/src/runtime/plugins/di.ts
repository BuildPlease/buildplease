import 'reflect-metadata';
import { ScopeController } from '@buildplease/webkit';

import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin({
  name: 'nuxtkit:plugin:di',
  setup(_nuxt) {
    const scopeController = new ScopeController();

    return {
      provide: {
        scopeController: scopeController,
        getInstance: <T>(id: symbol): T => scopeController.getInstance<T>(id),
      },
    };
  },
});
