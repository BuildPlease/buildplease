import type { Nuxt } from '@nuxt/schema';
import { addImportsDir, addImports } from '@nuxt/kit';

import type { NuxtKitContext } from '../context';

export async function prepareAutoImports({ resolver }: NuxtKitContext, _nuxt: Nuxt) {
  await prepareNetworkingImports(resolver);
  await prepareInfrastructureImports(resolver);
  await prepareArchitectureImports(resolver);
  await prepareComposablesImports(resolver);
}

async function prepareNetworkingImports(resolver: any) {
  addImportsDir([resolver.resolve('./runtime/networking')]);
}

async function prepareInfrastructureImports(resolver: any) {
  addImportsDir([resolver.resolve('./runtime/infrastructure')]);
}

async function prepareArchitectureImports(resolver: any) {
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
    {
      name: 'ViewModel',
      as: 'ViewModel',
      from: resolver.resolve('./runtime/architecture/view-model'),
    },
  ]);
}

async function prepareComposablesImports(resolver: any) {
  addImports([
    {
      name: 'ErrorHandlerOptions',
      from: resolver.resolve('./runtime/composables/use-error-handler'),
      type: true,
    },
    {
      name: 'useErrorHandler',
      from: resolver.resolve('./runtime/composables/use-error-handler'),
    },
    {
      name: 'useInstance',
      from: resolver.resolve('./runtime/composables/use-instance'),
    },
    {
      name: 'useScopeController',
      from: resolver.resolve('./runtime/composables/use-scope-controller'),
    },
    {
      name: 'UseCurrentLocaleOptions',
      from: resolver.resolve('./runtime/composables/use-current-locale'),
      type: true,
    },
    {
      name: 'useCurrentLocale',
      from: resolver.resolve('./runtime/composables/use-current-locale'),
    },
  ]);
}
