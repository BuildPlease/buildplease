import { builtinModules } from 'node:module';

import type {
  DependencyBundlingMatcher,
  DependencyBundlingPackageJSON,
  DependencyBundlingPolicy,
  MakeDependencyBundlingPolicyOptions,
} from './dependency-bundling-policy';

export function makeDependencyBundlingPolicy(
  pkg: DependencyBundlingPackageJSON,
  opts: MakeDependencyBundlingPolicyOptions = {},
): DependencyBundlingPolicy {
  const includePeers = opts.includePeers ?? true;
  const includeDependencies = opts.includeDependencies ?? true;
  const includeSubpaths = opts.includeSubpaths ?? true;
  const includeNodeBuiltins = opts.includeNodeBuiltins ?? true;
  const allowPeerBundling = opts.allowPeerBundling ?? false;

  const peers = Object.keys(pkg.peerDependencies ?? {});
  const dependencies = Object.keys(pkg.dependencies ?? {});

  const bundle = uniqueStrings(opts.bundle ?? []);
  const external = uniqueStrings(opts.external ?? []);

  assertNoExternalBundleConflicts(external, bundle);
  assertNoNodeBuiltinBundling(bundle);

  if (!allowPeerBundling) {
    assertNoPeerBundling(peers, bundle);
  }

  const bundledPackages = new Set(bundle.map(getPackageName));

  const peerExternals = includePeers ? peers.filter((name) => !bundledPackages.has(name)) : [];
  const dependencyExternals = includeDependencies ? dependencies.filter((name) => !bundledPackages.has(name)) : [];

  return {
    external: uniqueMatchers([
      ...(includeNodeBuiltins ? makeNodeBuiltinMatchers() : []),
      ...makePackageMatchers([...peerExternals, ...dependencyExternals, ...external], includeSubpaths),
    ]),
    bundle: uniqueMatchers(makePackageMatchers(bundle, includeSubpaths)),
  };
}

// MARK: - Private

function makeNodeBuiltinMatchers(): DependencyBundlingMatcher[] {
  const bareBuiltins = uniqueStrings(builtinModules.map(stripNodePrefix));
  const prefixedBuiltins = bareBuiltins.map((name) => `node:${name}`);

  return uniqueMatchers([...bareBuiltins, ...prefixedBuiltins, /^node:/]);
}

function makePackageMatchers(names: readonly string[], includeSubpaths: boolean): DependencyBundlingMatcher[] {
  if (!includeSubpaths) {
    return [...names];
  }

  return names.map((name) => makePackageMatcher(name));
}

function makePackageMatcher(name: string): DependencyBundlingMatcher {
  if (isPatternLike(name)) {
    return name;
  }

  return new RegExp(`^${escapeRegExp(name)}(?:/.*)?$`);
}

function uniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values));
}

function uniqueMatchers(values: readonly DependencyBundlingMatcher[]): DependencyBundlingMatcher[] {
  const seen = new Set<string>();
  const result: DependencyBundlingMatcher[] = [];

  for (const value of values) {
    const key = getMatcherKey(value);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(value);
  }

  return result;
}

function getMatcherKey(value: DependencyBundlingMatcher): string {
  return typeof value === 'string' ? `string:${value}` : `regexp:${value.source}/${value.flags}`;
}

function getPackageName(moduleId: string): string {
  if (moduleId.startsWith('@')) {
    const [scope, name] = moduleId.split('/');

    if (scope && name) {
      return `${scope}/${name}`;
    }

    return moduleId;
  }

  const [name] = moduleId.split('/');

  return name ?? moduleId;
}

function stripNodePrefix(moduleId: string): string {
  return moduleId.startsWith('node:') ? moduleId.slice('node:'.length) : moduleId;
}

function isPatternLike(name: string): boolean {
  return name.includes('*') || name.startsWith('^') || name.endsWith('$');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertNoExternalBundleConflicts(external: readonly string[], bundle: readonly string[]): void {
  const externalPackages = new Set(external.map(getPackageName));
  const conflicts = bundle.filter((name) => externalPackages.has(getPackageName(name)));

  if (conflicts.length === 0) {
    return;
  }

  throw new Error(`Packages cannot be both external and bundled: ${conflicts.join(', ')}`);
}

function assertNoPeerBundling(peers: readonly string[], bundle: readonly string[]): void {
  const peerSet = new Set(peers);
  const bundledPeers = bundle.filter((name) => peerSet.has(getPackageName(name)));

  if (bundledPeers.length === 0) {
    return;
  }

  throw new Error(`Peer dependencies must stay external and cannot be bundled by default: ${bundledPeers.join(', ')}`);
}

function assertNoNodeBuiltinBundling(bundle: readonly string[]): void {
  const bareBuiltins = new Set(builtinModules.map(stripNodePrefix));
  const bundledBuiltins = bundle.filter((name) => isNodeBuiltinSpecifier(name, bareBuiltins));

  if (bundledBuiltins.length === 0) {
    return;
  }

  throw new Error(`Node.js built-in modules cannot be bundled: ${bundledBuiltins.join(', ')}`);
}

function isNodeBuiltinSpecifier(moduleId: string, bareBuiltins: ReadonlySet<string>): boolean {
  const normalized = stripNodePrefix(moduleId);
  const [root] = normalized.split('/');

  return root ? bareBuiltins.has(root) : bareBuiltins.has(normalized);
}
