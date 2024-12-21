import {
  defineNuxtModule,
  createResolver,
  addImportsDir,
  addImports,
  addPlugin,
  type Resolver,
} from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';

export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'meowv-nuxtkit',
    configKey: 'meowvNuxtkit',
  },
  defaults: {},
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);

    configureHooks(nuxt, resolver);
    configureImports(resolver);
    configurePlugin(resolver);
  },
});

function configureHooks(app: Nuxt, resolver: Resolver) {
  app.options.vite.esbuild = {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
  };

  app.hook('nitro:build:before', (nitro) => {
    nitro.options.moduleSideEffects.push('reflect-metadata');
  });

  app.options.build.transpile.push(resolver.resolve('./runtime'));
}

function configureImports(resolver: Resolver) {
  addImportsDir([
    resolver.resolve('./runtime/composables'),
    resolver.resolve('./runtime/infrastructure'),
  ]);

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
      from: resolver.resolve('./runtime/architecture/viewModel'),
    },
  ]);
}

function configurePlugin(resolver: Resolver) {
  addPlugin({
    src: resolver.resolve('./runtime/plugin'),
    mode: 'all',
    order: 0,
  });
}
