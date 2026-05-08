import fastifyCors, { type FastifyCorsOptions } from '@fastify/cors';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import type { CorsConfig } from '@/configuration';
import type { ServerPluginOptions } from '@/server';

const pluginName = 'ApiKit@cors';

type OriginEntry = string | RegExp | boolean;

interface FormatOriginOptions {
  includeWwwSubdomain: boolean;
}

const corsPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const config = options.apikitController.cors;

  if (!config.enabled) return;

  await fastify.register(fastifyCors, makeCorsOptions(config));
};

export default fp(corsPlugin, {
  name: pluginName,
});

// MARK: - Private

function makeCorsOptions(config: CorsConfig): FastifyCorsOptions {
  const origin = config.allowAllOrigins
    ? true
    : formatOrigin(config.options.origin, { includeWwwSubdomain: config.includeWwwSubdomain });

  return {
    ...config.options,
    origin: origin,
  };
}

function formatOrigin(
  origin: FastifyCorsOptions['origin'],
  options: FormatOriginOptions,
): FastifyCorsOptions['origin'] {
  if (!origin) return origin;

  if (typeof origin === 'string') {
    return formatAllowedOrigin(origin, options);
  }

  if (Array.isArray(origin)) {
    return formatOriginList(origin, options);
  }

  return origin;
}

function formatOriginList(
  input: readonly unknown[],
  options: FormatOriginOptions,
): FastifyCorsOptions['origin'] {
  const output: OriginEntry[] = [];

  for (const entry of input) {
    appendOriginEntry(output, entry, options);
  }

  return uniqueOrigins(output) as FastifyCorsOptions['origin'];
}

function appendOriginEntry(output: OriginEntry[], entry: unknown, options: FormatOriginOptions): void {
  if (typeof entry === 'string') {
    output.push(...formatAllowedOrigin(entry, options));
    return;
  }

  if (entry instanceof RegExp || typeof entry === 'boolean') {
    output.push(entry);
    return;
  }

  if (Array.isArray(entry)) {
    for (const nestedEntry of entry) {
      appendOriginEntry(output, nestedEntry, options);
    }
  }
}

function formatAllowedOrigin(input: string, options: FormatOriginOptions): string[] {
  const origin = parseOrigin(input);
  if (!origin) return [input];

  if (!options.includeWwwSubdomain) return [origin];

  const { protocol, host } = new URL(origin);
  const isHostname = /^[a-zA-Z][a-zA-Z0-9.-]*$/.test(host);

  if (!isHostname) return [origin];

  const wwwHost = host.startsWith('www.') ? host : `www.${host}`;

  return [origin, `${protocol}//${wwwHost}`];
}

function parseOrigin(input: string): string | null {
  try {
    const { protocol, host } = new URL(input);
    return `${protocol}//${host}`;
  } catch {
    return null;
  }
}

function uniqueOrigins(input: readonly OriginEntry[]): OriginEntry[] {
  const strings = new Set<string>();
  const output: OriginEntry[] = [];

  for (const entry of input) {
    if (typeof entry !== 'string') {
      output.push(entry);
      continue;
    }

    if (strings.has(entry)) continue;

    strings.add(entry);
    output.push(entry);
  }

  return output;
}
