import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import type { Nuxt } from '@nuxt/schema';
import { tryResolveModule, type Resolver } from '@nuxt/kit';

import type { NuxtKitContext } from '../context';

/**
 * Validate this module’s prerequisites:
 * - all non-optional peerDependencies of this package are installed in the app
 * - Nuxt major version is >= required
 * - required Nuxt module(s) are declared
 * - (optionally) extra packages are installed
 */
export async function validateDependencies(ctx: NuxtKitContext, nuxt: Nuxt): Promise<void> {
  try {
    await ensurePeerDepsInstalled(nuxt, ctx.resolver);
    await ensureNuxtMajor(nuxt, 4);
    await ensureNuxtModule(nuxt, ['@nuxtjs/i18n', '@nuxtjs/i18n-edge']);
  } catch (error) {
    ctx.logger.fatal(error instanceof Error ? error.message : String(error));
  }
}

/** Require Nuxt major version >= `major`. */
export async function ensureNuxtMajor(nuxt: Nuxt, major: number): Promise<void> {
  if (!nuxt.options._majorVersion || nuxt.options._majorVersion < major) {
    throw new Error(`Nuxt ${major} or later is required.`);
  }
}

/** Require at least one of the candidate module IDs to be declared in `nuxt.config.modules`. */
export async function ensureNuxtModule(nuxt: Nuxt, candidates: string[]): Promise<void> {
  const mods = nuxt.options.modules || [];
  const matches = (input: unknown): boolean => {
    if (typeof input === 'string') return candidates.includes(input);

    if (Array.isArray(input)) return matches(input[0]);

    if (input && typeof input === 'object') {
      const o = input as any;
      if (typeof o.src === 'string' && candidates.includes(o.src)) return true;
      if (typeof o.meta?.name === 'string' && candidates.includes(o.meta.name)) return true;
    }
    return false;
  };

  if (!mods.some(matches)) {
    throw new Error(`Required module not found. Add "${candidates.join('" or "')}" to \`modules\`.`);
  }
}

/** Require a list of packages to be resolvable from the app. */
export async function ensurePackagesInstalled(nuxt: Nuxt, names: string[]): Promise<void> {
  const urls = projectProbeUrls(nuxt);
  const missing: string[] = [];

  for (const name of names) {
    const resolved = await tryResolveModule(name, urls);
    if (!resolved) missing.push(name);
  }

  if (missing.length) {
    throw new Error(
      `Missing dependenc${missing.length > 1 ? 'ies' : 'y'} ${missing.map((n) => `"${n}"`).join(', ')}. ` +
        `Make sure ${missing.length > 1 ? 'they are' : 'it is'} installed.`,
    );
  }
}

/** Ensure all non-optional peerDependencies of *this package* are installed in the app. */
export async function ensurePeerDepsInstalled(nuxt: Nuxt, resolver: Resolver): Promise<void> {
  const pkgPath = resolver.resolve('../package.json');
  const raw = await readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(raw) as {
    peerDependencies?: Record<string, string>;
    peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  };

  const peers = Object.keys(pkg.peerDependencies ?? {});
  if (!peers.length) return;

  const optional = new Set(
    Object.entries(pkg.peerDependenciesMeta ?? {})
      .filter(([, meta]) => meta?.optional)
      .map(([n]) => n),
  );
  const required = peers.filter((n) => !optional.has(n));
  if (!required.length) return;

  await ensurePackagesInstalled(nuxt, required);
}

/** Build URL[] to app roots for tryResolveModule(URL[]). */
function projectProbeUrls(nuxt: Nuxt): URL[] {
  const roots = [nuxt.options.rootDir, nuxt.options.srcDir, nuxt.options.buildDir].filter(
    Boolean,
  ) as string[];
  return roots.map((dir) => new URL('package.json', pathToFileURL(dir.endsWith('/') ? dir : dir + '/')));
}
