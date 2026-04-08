import type { Nuxt } from '@nuxt/schema';

import type { NuxtKitContext } from '../context';

/**
 * Prepare this module’s prerequisites:
 * - required declared Nuxt module(s) are installed
 */
export async function prepareDependencies(context: NuxtKitContext, nuxt: Nuxt): Promise<void> {
  try {
    await ensureNuxtModule(nuxt, ['@nuxt/ui']);
  } catch (error) {
    context.logger.fatal(error instanceof Error ? error.message : String(error));
  }
}

/** Require at least one of the candidate module IDs to be declared in `nuxt.config.modules`. */
export async function ensureNuxtModule(nuxt: Nuxt, candidates: string[]): Promise<void> {
  const mods = nuxt.options.modules || [];

  const matches = (input: unknown): boolean => {
    if (typeof input === 'string') return candidates.includes(input);

    if (Array.isArray(input)) return matches(input[0]);

    if (input && typeof input === 'object') {
      const object = input as any;
      if (typeof object.src === 'string' && candidates.includes(object.src)) return true;
      if (typeof object.meta?.name === 'string' && candidates.includes(object.meta.name)) return true;
    }

    return false;
  };

  if (!mods.some(matches)) {
    throw new Error(`Required module not found. Add "${candidates.join('" or "')}" to \`modules\`.`);
  }
}
