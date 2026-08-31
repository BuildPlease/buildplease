import { addPlugin } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';

import type { NuxtKitContext } from '../context';

export async function prepareRuntime(context: NuxtKitContext, nuxt: Nuxt): Promise<void> {
  const { resolver } = context;
  const r = (p: string) => resolver.resolve(p);

  addPlugin({ src: r('./runtime/plugins/zod-i18n'), mode: 'client' });

  type Entry = Readonly<{ alias: string; path: string }>;

  const entries: Entry[] = [
    { alias: '#nuxtkit', path: './runtime' },
    { alias: '#nuxtkit-public', path: './public' },
  ];
  const alias = Object.fromEntries(entries.map(({ alias, path }) => [alias, r(path)]));
  Object.assign(nuxt.options.alias, alias);
  nuxt.options.build.transpile.push(...Object.values(alias));
}
