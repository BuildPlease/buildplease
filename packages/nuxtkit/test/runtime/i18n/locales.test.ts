import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { resolveModuleLocales } from '@/src/prepare/i18n-locales';

const LOCALE_DIRECTORY = resolve(import.meta.dirname, '../../../src/runtime/i18n/locales');

describe('NuxtKit i18n locales', () => {
  it('ships error and Zod messages under the meawkit namespace', async () => {
    const locales = await readLocales();

    for (const messages of Object.values(locales)) {
      expect(messages.meawkit.error.generic).toBeTypeOf('string');
      expect(messages.meawkit.error.unauthorized).toBeTypeOf('string');
      expect(messages.meawkit.zod).toBeTypeOf('object');
      expect(messages).not.toHaveProperty('zod');
    }
  });

  it('keeps shipped locale keys in parity', async () => {
    const locales = await readLocales();
    const keySets = Object.values(locales).map((messages) => flattenKeys(messages));
    const reference = keySets[0];

    for (const keys of keySets.slice(1)) {
      expect(keys).toEqual(reference);
    }
  });

  it('maps application locales to supported NuxtKit locale files', () => {
    const locales = resolveModuleLocales(
      [
        { code: 'en-GB', language: 'en-GB' },
        { code: 'sk', language: 'sk-SK' },
        { code: 'cs', language: 'cs-CZ' },
        { code: 'fr-FR', language: 'fr-FR' },
      ],
      ['cs-CZ', 'en-US', 'sk-SK'],
    );

    expect(locales).toEqual([
      { code: 'en-GB', file: 'en-US.json' },
      { code: 'sk', file: 'sk-SK.json' },
      { code: 'cs', file: 'cs-CZ.json' },
    ]);
  });

  it('supports string locale definitions', () => {
    const locales = resolveModuleLocales(['en', 'sk'], ['en-US', 'sk-SK']);

    expect(locales).toEqual([
      { code: 'en', file: 'en-US.json' },
      { code: 'sk', file: 'sk-SK.json' },
    ]);
  });
});

interface NuxtKitLocaleMessages {
  meawkit: {
    error: {
      generic: string;
      unauthorized: string;
    };
    zod: Record<string, unknown>;
  };
}

async function readLocales(): Promise<Record<string, NuxtKitLocaleMessages>> {
  const files = (await readdir(LOCALE_DIRECTORY)).filter((file) => file.endsWith('.json')).sort();
  const locales: Record<string, NuxtKitLocaleMessages> = {};

  for (const file of files) {
    const content = await readFile(resolve(LOCALE_DIRECTORY, file), 'utf8');
    locales[file] = JSON.parse(content) as NuxtKitLocaleMessages;
  }

  return locales;
}

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return prefix ? [prefix] : [];

  const entries = Object.entries(value as Record<string, unknown>);
  const keys = entries.flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return flattenKeys(child, path);
  });

  return keys.sort();
}
