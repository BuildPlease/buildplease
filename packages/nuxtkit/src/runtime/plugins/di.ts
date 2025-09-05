import { ScopeController } from '@nidavellirx/meowv-webkit';

import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin({
  name: 'nuxtkit:plugin',
  setup(_nuxtApp) {
    const scopeController = new ScopeController();

    return {
      provide: {
        scopeController,
        getInstance: <T>(id: symbol): T => scopeController.getInstance<T>(id),
      },
    };
  },
});
