import type { Nuxt } from '@nuxt/schema';
import { addImportsDir, addImports } from '@nuxt/kit';

import type { NuxtKitContext } from '../context';

export async function prepareAutoImports({ resolver }: NuxtKitContext, _nuxt: Nuxt) {
  addImportsDir([resolver.resolve('./runtime/infrastructure')]);
  addImportsDir([resolver.resolve('./runtime/networking')]);
  addImportsDir([resolver.resolve('./runtime/composables')]);

  addImports([
    {
      name: 'Controller',
      as: 'Controller',
      from: resolver.resolve('./runtime/architecture/controller'),
      type: true,
    },
    {
      name: 'ControllerImpl',
      as: 'ControllerImpl',
      from: resolver.resolve('./runtime/architecture/controller'),
    },
  ]);

  addImports([
    {
      name: 'ViewModel',
      as: 'ViewModel',
      from: resolver.resolve('./runtime/architecture/view-model'),
    },
  ]);
}
