import type { Nuxt } from '@nuxt/schema';
import { addImportsDir, addImports, addComponentsDir, type Resolver } from '@nuxt/kit';

import type { NuxtKitContext } from '../context';

export async function prepareAutoImports(context: NuxtKitContext, _nuxt: Nuxt) {
  const resolver = context.resolver;

  await prepareComponents(context);
  await prepareNetworkingImports(resolver);
  await prepareInfrastructureImports(resolver);
  await prepareArchitectureImports(resolver);
  await prepareComposablesImports(resolver);
}

export async function prepareComponents(context: NuxtKitContext) {
  const { resolver, options } = context;

  addComponentsDir({
    path: resolver.resolve('./runtime/components'),
    prefix: options.components.prefix,
    pathPrefix: false,
  });
}

async function prepareNetworkingImports(resolver: Resolver) {
  addImportsDir([resolver.resolve('./runtime/networking')]);
}

async function prepareInfrastructureImports(resolver: Resolver) {
  addImportsDir([resolver.resolve('./runtime/infrastructure')]);
}

async function prepareArchitectureImports(resolver: Resolver) {
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

async function prepareComposablesImports(resolver: Resolver) {
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
      name: 'useBindViewModel',
      from: resolver.resolve('./runtime/composables/use-bind-view-model'),
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
    {
      name: 'definePluralRules',
      from: resolver.resolve('./runtime/composables/define-plural-rules'),
    },
    {
      name: 'PluralRulesOptions',
      from: resolver.resolve('./runtime/composables/define-plural-rules'),
      type: true,
    },
  ]);
}
