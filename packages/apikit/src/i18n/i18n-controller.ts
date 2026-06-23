import fs from 'node:fs';

import { ensureDirectory, resolvePath } from '@meawkit/core/node';
import i18next, { type InitOptions } from 'i18next';
import { inject, injectable } from 'inversify';
import merge from 'lodash.merge';

import type { ApiKitController, I18nConfig, I18nFileEntry } from '@/configuration';
import { ApiKitSymbols } from '@/di';

import { normalizeLocale, splitBaseRegion } from './utils';

const LOG_PREFIX = '[ApiKit:I18n]';

export interface ParseLocaleOptions {
  /**
   * If true, always ignore region (e.g., "en-GB" → "en").
   * Useful when you only ship base locales.
   * @default true
   */
  ignoreRegion?: boolean;
}

export interface I18nController {
  /** Initializes i18next with merged built-in and app-provided translations. */
  prepare(): Promise<void>;

  /**
   * Determines the client’s preferred language from an Accept-Language header,
   * honoring quality values (q=) and falling back to the configured default language.
   *
   * Matching strategy:
   *  - When `ignoreRegion` is false: prefer exact region (e.g., "en-gb"),
   *    then fall back to base ("en").
   *  - When `ignoreRegion` is true: always match by base only ("en-gb" → "en").
   *
   * @param input   Full Accept-Language header, e.g. "fr-CA,fr;q=0.8,en-US;q=0.6,en;q=0.4".
   * @param options Matching behavior.
   * @returns       Best matching language code.
   */
  parseLocale(input?: string, options?: ParseLocaleOptions): string;
}

@injectable()
export class I18nControllerImpl implements I18nController {
  constructor(
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    private readonly configurationController: ApiKitController,
  ) {}

  public async prepare(): Promise<void> {
    const initOptions = this.makeOptions();
    await i18next.init(initOptions);
  }

  public parseLocale(input?: string, options: ParseLocaleOptions = {}): string {
    const { supportedLanguages, defaultLanguage } = this.makeConfig();
    const { ignoreRegion = true } = options;

    if (!input || !input.trim()) return defaultLanguage;

    const supported = new Set(supportedLanguages.map((language) => language.toLowerCase()));

    type Best = { code: string; q: number; idx: number };

    let bestExact: Best | undefined;
    let bestBase: Best | undefined;
    let idx = 0;

    for (const part of input.split(',')) {
      const trimmed = part.trim();

      if (!trimmed) {
        idx++;
        continue;
      }

      const pieces = trimmed.split(';');
      const raw = pieces[0] ?? '';
      const lang = normalizeLocale(raw);

      if (!lang || lang === '*') {
        idx++;
        continue;
      }

      const qToken = pieces.find((token) => token.startsWith('q='));
      const q = parseQualityValue(qToken);

      if (q === 0) {
        idx++;
        continue;
      }

      const { base } = splitBaseRegion(lang);

      if (!base) {
        idx++;
        continue;
      }

      if (!ignoreRegion && supported.has(lang)) {
        if (!bestExact || q > bestExact.q || (q === bestExact.q && idx < bestExact.idx)) {
          bestExact = { code: lang, q, idx };
        }
      }

      if (supported.has(base)) {
        if (!bestBase || q > bestBase.q || (q === bestBase.q && idx < bestBase.idx)) {
          bestBase = { code: base, q, idx };
        }
      }

      idx++;
    }

    if (bestExact) return bestExact.code;
    if (bestBase) return bestBase.code;

    return defaultLanguage;
  }

  // MARK: - Private

  private makeOptions(): InitOptions {
    const config = this.makeConfig();
    const resources = makeResources(config);

    return {
      debug: false,

      lng: config.defaultLanguage,
      fallbackLng: config.fallbackLanguages,
      supportedLngs: config.supportedLanguages,
      load: config.load,
      nonExplicitSupportedLngs: config.nonExplicitSupportedLngs,
      preload: config.preload,
      lowerCaseLng: config.lowerCaseLng,
      cleanCode: config.cleanCode,

      ns: config.namespaces,
      defaultNS: config.defaultNamespace,

      keySeparator: config.keySeparator,
      nsSeparator: config.nsSeparator,
      pluralSeparator: config.pluralSeparator,
      contextSeparator: config.contextSeparator,

      resources: resources,
    };
  }

  private makeConfig(): ResolvedI18nConfig {
    const input = this.configurationController.i18n ?? {};

    const defaultNamespace = input.defaultNamespace ?? 'translation';
    const defaultLanguage = input.defaultLanguage ?? 'en';
    const fallbackLanguages = input.fallbackLanguages ?? defaultLanguage;

    const directories = (input.directories ?? []).map((directory) => ({
      path: directory.path,
      namespace: directory.namespace ?? defaultNamespace,
    }));

    const files = (input.files ?? []).map((file) => ({
      locale: file.locale,
      path: file.path,
      namespace: file.namespace ?? defaultNamespace,
    }));

    const namespaces = this.makeNamespaces(input.namespaces, defaultNamespace, directories, files);

    return {
      directories: directories,
      files: files,

      defaultLanguage: defaultLanguage,
      fallbackLanguages: fallbackLanguages,
      supportedLanguages: input.supportedLanguages ?? ['en', 'sk', 'cs'],

      load: input.load ?? 'languageOnly',
      nonExplicitSupportedLngs: input.nonExplicitSupportedLngs ?? true,
      preload: input.preload ?? false,
      lowerCaseLng: input.lowerCaseLng ?? true,
      cleanCode: input.cleanCode ?? true,

      namespaces: namespaces,
      defaultNamespace: defaultNamespace,

      keySeparator: input.keySeparator ?? '.',
      nsSeparator: input.nsSeparator ?? ':',
      pluralSeparator: input.pluralSeparator ?? '_',
      contextSeparator: input.contextSeparator ?? '_',
    };
  }

  private makeNamespaces(
    input: I18nConfig['namespaces'],
    defaultNamespace: string,
    directories: ResolvedI18nDirEntry[],
    files: ResolvedI18nFileEntry[],
  ): string[] {
    const configured = Array.isArray(input)
      ? input.filter((value): value is string => typeof value === 'string')
      : typeof input === 'string'
        ? [input]
        : [];

    const namespaces = new Set<string>(configured.length ? configured : [defaultNamespace]);

    for (const directory of directories) {
      namespaces.add(directory.namespace);
    }

    for (const file of files) {
      namespaces.add(file.namespace);
    }

    return Array.from(namespaces);
  }
}

// MARK: - Types

type ResourceEntry = {
  locale: string;
  ns: string;
  path: string;
};

type ResolvedI18nDirEntry = {
  path: string;
  namespace: string;
};

type ResolvedI18nFileEntry = {
  locale: string;
  path: string;
  namespace: string;
};

type ResolvedI18nConfig = Required<Omit<I18nConfig, 'directories' | 'files'>> & {
  directories: ResolvedI18nDirEntry[];
  files: ResolvedI18nFileEntry[];
};

// MARK: - Locale resources

function makeResources(config: ResolvedI18nConfig): Record<string, any> {
  const entries: ResourceEntry[] = [
    ...collectBuiltinEntries(config),
    ...collectDirectoryEntries(config),
    ...collectFileEntries(config),
  ];

  const resources: Record<string, any> = {};

  for (const { locale, ns, path } of entries) {
    const bucket = (resources[locale] ||= {});
    const json = JSON.parse(fs.readFileSync(path, 'utf-8'));

    bucket[ns] = merge(bucket[ns] || {}, json);
  }

  return resources;
}

function collectBuiltinEntries(config: ResolvedI18nConfig): ResourceEntry[] {
  const localesPath = resolvePath(import.meta.url, './locales');
  const files = resolveLocalesFromDir(localesPath);

  return files.map((file) => ({
    locale: file.locale,
    ns: config.defaultNamespace,
    path: file.path,
  }));
}

function collectDirectoryEntries(config: ResolvedI18nConfig): ResourceEntry[] {
  const entries: ResourceEntry[] = [];

  for (const directory of config.directories) {
    const directoryPath = resolvePath(process.cwd(), directory.path);
    const files = resolveLocalesFromDir(directoryPath);

    for (const file of files) {
      entries.push({
        locale: file.locale,
        ns: directory.namespace,
        path: file.path,
      });
    }
  }

  return entries;
}

function collectFileEntries(config: ResolvedI18nConfig): ResourceEntry[] {
  return config.files.map((file) => ({
    locale: file.locale,
    ns: file.namespace,
    path: resolvePath(process.cwd(), file.path),
  }));
}

function resolveLocalesFromDir(dir: string): I18nFileEntry[] {
  const absolute = ensureDirectory(dir);
  const files = fs.readdirSync(absolute).filter((file) => file.endsWith('.json'));

  if (!files.length) throw new Error(`${LOG_PREFIX} No .json files in ${absolute}`);

  return files.map((file) => ({
    locale: file.replace(/\.json$/, ''),
    path: resolvePath(absolute, file),
  }));
}

// MARK: - Locale parsing

function parseQualityValue(input?: string): number {
  if (!input) return 1;

  const value = parseFloat(input.slice(2).replace(',', '.'));

  if (!Number.isFinite(value)) return 1;

  return Math.max(0, Math.min(1, value));
}
