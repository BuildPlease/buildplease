import type { Nuxt } from '@nuxt/schema';
import { addPlugin } from '@nuxt/kit';

import type { NuxtKitContext } from '../context';

type Entry = Readonly<{ alias: string; path: string }>;

export async function prepareRuntime(context: NuxtKitContext, nuxt: Nuxt) {
  const { resolver } = context;
  const r = (p: string) => resolver.resolve(p);

  addPlugin({ src: r('./runtime/plugins/di'), mode: 'all', order: 0 });
  addPlugin({ src: r('./runtime/plugins/zod-i18n'), mode: 'all', order: 1 });

  const entries: Entry[] = [
    { alias: '#nuxtkit', path: './runtime' },
    { alias: '#nuxtkit-internal', path: './runtime-internal' },
    { alias: '#shared', path: './shared' },
  ];
  const alias = Object.fromEntries(entries.map(({ alias, path }) => [alias, r(path)]));
  Object.assign(nuxt.options.alias, alias);
  nuxt.options.build.transpile.push(...Object.values(alias));

  nuxt.options.imports.transform ??= {};
  nuxt.options.imports.transform.include ??= [];
}
