import type { ArchicatAppContract, ArchicatAppInput } from './app-config';

/**
 * @description Defines one Archicat app composition root.
 */
export function defineApp(app: ArchicatAppInput): ArchicatAppContract {
  return Object.freeze({
    kind: 'app',
    name: app.name,
    ...(app.root === undefined ? {} : { root: app.root }),
    dependencies: Object.freeze([...(app.dependencies ?? [])]),
  });
}
