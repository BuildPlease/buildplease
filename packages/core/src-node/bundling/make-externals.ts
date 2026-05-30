import { builtinModules } from 'node:module';

import type { PackageJSONModel } from '@node/package-json';

export type MakeExternalsOptions = {
  /**
   * Dependency names that should be **bundled** into the output.
   *
   * Any dependency listed here will be **removed** from the generated externals list,
   * even if it exists in `dependencies`.
   *
   * Use this when you want a more self-contained bundle (typical for CLIs).
   *
   * @example ['citty', 'consola']
   */
  bundled?: readonly string[];

  /**
   * Additional externals to force, even if they are not present in
   * `dependencies` / `peerDependencies`.
   *
   * Useful for:
   * - dynamic imports resolved at runtime (e.g. `import(name)`),
   * - optional deps you don't want bundled,
   * - "virtual" module ids.
   *
   * @example ['pino/file']
   */
  extra?: readonly string[];

  /**
   * Whether to include `peerDependencies` as externals.
   *
   * Recommended `true` for libraries (peer deps must stay external).
   *
   * @default true
   */
  includePeers?: boolean;

  /**
   * Whether to include `dependencies` as externals.
   *
   * Recommended `true` for libraries to avoid double-bundling deps into consumers.
   * Set to `false` if you want to bundle most deps (and then manage with `bundled`).
   *
   * @default true
   */
  includeDependencies?: boolean;

  /**
   * Whether to also externalize subpath imports for each external.
   *
   * Example: for `zod`, also adds `zod/*`.
   * This prevents bundlers from accidentally inlining deep imports.
   *
   * @default true
   */
  includeSubpaths?: boolean;

  /**
   * Whether to include Node.js built-in modules as externals.
   *
   * Adds:
   * - bare builtins (`fs`, `path`, ...)
   * - `node:`-prefixed builtins (`node:fs`, `node:path`, ...)
   * - `node:*` wildcard (covers `node:` specifiers in tooling)
   *
   * Use `true` for Node/neutral outputs.
   * Use `false` for browser-only bundles.
   *
   * @default true
   */
  includeNodeBuiltins?: boolean;
};

export function makeExternals(pkg: PackageJSONModel, opts: MakeExternalsOptions = {}): string[] {
  const bundled = new Set(opts.bundled ?? []);
  const extra = opts.extra ?? [];

  const includePeers = opts.includePeers ?? true;
  const includeDependencies = opts.includeDependencies ?? true;
  const includeSubpaths = opts.includeSubpaths ?? true;
  const includeNodeBuiltins = opts.includeNodeBuiltins ?? true;

  const peers = includePeers ? Object.keys(pkg.peerDependencies ?? {}) : [];
  const deps = includeDependencies ? Object.keys(pkg.dependencies ?? {}).filter((n) => !bundled.has(n)) : [];

  const builtins = includeNodeBuiltins ? [...builtinModules, ...builtinModules.map((m) => `node:${m}`), 'node:*'] : [];

  const withSubpaths = (names: string[]) => (includeSubpaths ? [...names, ...names.map((n) => `${n}/*`)] : names);

  return Array.from(new Set([...builtins, ...withSubpaths(peers), ...withSubpaths(deps), ...extra]));
}
