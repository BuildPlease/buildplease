import { type Resolver, addComponentsDir, addImports } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';

import type { NuxtKitContext } from '../context';

export async function prepareAutoImports(context: NuxtKitContext, _nuxt: Nuxt): Promise<void> {
  const resolver = context.resolver;

  await prepareComponents(context);
  await prepareNetworkingImports(resolver);
  await prepareInfrastructureImports(resolver);
  await prepareArchitectureImports(resolver);
  await prepareComposablesImports(resolver);
}

export async function prepareComponents(context: NuxtKitContext): Promise<void> {
  const { resolver, options } = context;

  addComponentsDir({
    path: resolver.resolve('./runtime/components'),
    prefix: options.components.prefix,
    pathPrefix: false,
  });
}

async function prepareNetworkingImports(resolver: Resolver): Promise<void> {
  addImports([
    {
      name: 'LanguageInterceptor',
      from: resolver.resolve('./runtime/networking/language-interceptor'),
    },
    {
      name: 'SSRRequestCookiesInterceptor',
      from: resolver.resolve('./runtime/networking/ssr-request-cookies-interceptor'),
    },
  ]);
}

async function prepareInfrastructureImports(resolver: Resolver): Promise<void> {
  addImports([
    {
      name: 'isSSR',
      from: resolver.resolve('./runtime/infrastructure/environment'),
    },
    {
      name: 'isCSR',
      from: resolver.resolve('./runtime/infrastructure/environment'),
    },
    {
      name: 'isDev',
      from: resolver.resolve('./runtime/infrastructure/environment'),
    },
    {
      name: 'isHydrating',
      from: resolver.resolve('./runtime/infrastructure/environment'),
    },
    {
      name: 'Lifecycle',
      from: resolver.resolve('./runtime/infrastructure/lifecycle'),
      type: true,
    },
  ]);
}

async function prepareArchitectureImports(resolver: Resolver): Promise<void> {
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

async function prepareComposablesImports(resolver: Resolver): Promise<void> {
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
  ]);
}
