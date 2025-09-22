import fs from 'node:fs';

import { inject, injectable } from 'inversify';
import i18next, { type InitOptions } from 'i18next';
import merge from 'lodash.merge';

import { ApiKitSymbols } from '#/di';
import { resolvePath, ensureDirectory } from '#/file';
import type { ApiKitController, I18nConfig, I18nFileEntry } from '#/configuration';

type ResourceEntry = {
  locale: string;
  ns: string;
  path: string;
};

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
   *  - When `ignoreRegion` is false (default false → see ParseLocaleOptions): prefer exact region (e.g., "en-gb"),
   *    then fall back to base ("en").
   *  - When `ignoreRegion` is true (default true): always match by base only ("en-gb" → "en").
   *
   * @param input   Full Accept-Language header, e.g. "fr-CA,fr;q=0.8,en-US;q=0.6,en;q=0.4".
   * @param options Matching behavior (e.g., ignoreRegion).
   * @returns       Best matching language code (e.g., "fr", "en", or "en-gb" if supported).
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
    const config = this.prepareConfig();
    const resources = this.makeResources(config);

    const initOptions: InitOptions = {
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

      debug: config.debug,
      resources,
    };

    await i18next.init(initOptions);
  }

  /**
   * Choose the best language from an Accept-Language header.
   *
   * Behavior:
   * - Honors q-values (quality weights).
   * - When `ignoreRegion` is false, prefers exact region (e.g., "en-gb") then base ("en").
   * - When `ignoreRegion` is true (default), always matches by base only.
   * - Falls back to configured default if nothing matches.
   *
   * @param input   Full Accept-Language header (e.g., "fr-CA,fr;q=0.8,en-US;q=0.6,en;q=0.4").
   * @param options Matching behavior (see ParseLocaleOptions).
   * @returns       Best matching language code (e.g., "en" or "en-gb" if region matching enabled).
   */
  public parseLocale(input?: string, options: ParseLocaleOptions = {}): string {
    const { supportedLanguages, defaultLanguage } = this.prepareConfig();
    const { ignoreRegion = true } = options;

    /** Early exit: empty or missing header → default language. */
    if (!input || !input.trim()) return defaultLanguage;

    /** Normalize supported languages to lowercase for stable comparisons. */
    const supported = new Set(supportedLanguages.map((s) => s.toLowerCase()));

    /** Helper: normalize a language tag (lowercase, "_"→"-", trim). */
    const norm = (s: string) => s.toLowerCase().replace(/_/g, '-').trim();

    /** Track the best exact-region and best base matches as we scan. */
    type Best = { code: string; q: number; idx: number };
    let bestExact: Best | undefined;
    let bestBase: Best | undefined;

    /** Scan header items left→right, computing q and base, updating best candidates. */
    let idx = 0;
    for (const part of input.split(',')) {
      const trimmed = part.trim();
      if (!trimmed) {
        idx++;
        continue;
      }

      /** Extract primary tag and optional params (e.g., ";q=0.8"). */
      const pieces = trimmed.split(';');
      const raw = pieces[0] ?? '';
      const lang = norm(raw);
      if (!lang || lang === '*') {
        idx++;
        continue;
      }

      /** Parse q-value (defaults to 1). Clamp to [0,1]. Robust to malformed numbers. */
      let q = 1;
      const qToken = pieces.find((t) => t.startsWith('q='));
      if (qToken) {
        const n = parseFloat(qToken.slice(2).replace(',', '.'));
        if (Number.isFinite(n)) q = Math.max(0, Math.min(1, n));
      }
      if (q === 0) {
        idx++;
        continue;
      } // explicitly unacceptable

      /** Compute base (e.g., "en-gb" → "en"). Skip if empty. */
      const base = lang.split('-')[0] || '';
      if (!base) {
        idx++;
        continue;
      }

      /** If region matching enabled, consider exact-region candidate. */
      if (!ignoreRegion && supported.has(lang)) {
        if (!bestExact || q > bestExact.q || (q === bestExact.q && idx < bestExact.idx)) {
          bestExact = { code: lang, q, idx };
        }
      }

      /** Always consider base candidate (works for base-only setups). */
      if (supported.has(base)) {
        if (!bestBase || q > bestBase.q || (q === bestBase.q && idx < bestBase.idx)) {
          bestBase = { code: base, q, idx };
        }
      }

      idx++;
    }

    /** Prefer exact-region when enabled; otherwise return best base; else fallback. */
    if (bestExact) return bestExact.code;
    if (bestBase) return bestBase.code;
    return defaultLanguage;
  }

  // MARK: - Private

  private prepareConfig(): Required<I18nConfig> {
    const ext = this.configurationController.i18n ?? {};

    // default namespace
    const defaultNS = typeof ext.defaultNamespace === 'string' ? ext.defaultNamespace : 'translation';

    // primary & fallback languages
    const defaultLanguage = ext.defaultLanguage ?? 'en';
    const fallbackLanguages = ext.fallbackLanguages ?? defaultLanguage;

    // flatten user namespaces
    const userNS: string[] = Array.isArray(ext.namespaces)
      ? ext.namespaces.filter((v): v is string => typeof v === 'string')
      : typeof ext.namespaces === 'string'
        ? [ext.namespaces]
        : [];

    // union with entry-level namespaces
    const nsSet = new Set<string>(userNS.length ? userNS : [defaultNS]);
    for (const d of ext.directories ?? []) if (d.namespace) nsSet.add(d.namespace);
    for (const f of ext.files ?? []) if (f.namespace) nsSet.add(f.namespace);

    return {
      directories: ext.directories ?? [],
      files: ext.files ?? [],

      defaultLanguage,
      fallbackLanguages,
      supportedLanguages: ext.supportedLanguages ?? ['en', 'sk', 'cs'],

      load: ext.load ?? 'languageOnly',
      nonExplicitSupportedLngs: ext.nonExplicitSupportedLngs ?? true,
      preload: ext.preload ?? false,
      lowerCaseLng: ext.lowerCaseLng ?? true,
      cleanCode: ext.cleanCode ?? true,

      namespaces: Array.from(nsSet),
      defaultNamespace: defaultNS,

      keySeparator: ext.keySeparator ?? '.',
      nsSeparator: ext.nsSeparator ?? ':',
      pluralSeparator: ext.pluralSeparator ?? '_',
      contextSeparator: ext.contextSeparator ?? '_',

      debug: ext.debug ?? false,
    };
  }

  private makeResources(config: Required<I18nConfig>): Record<string, any> {
    const entries: ResourceEntry[] = [
      ...this.collectBuiltinEntries(config),
      ...this.collectDirectoryEntries(config),
      ...this.collectFileEntries(config),
    ];

    // merge into resources[locale][ns]
    const resources: Record<string, any> = {};
    for (const { locale, ns, path } of entries) {
      const bucket = (resources[locale] ||= {});
      const json = JSON.parse(fs.readFileSync(path, 'utf-8'));
      bucket[ns] = merge(bucket[ns] || {}, json);
    }
    return resources;
  }

  private collectBuiltinEntries(config: Required<I18nConfig>): ResourceEntry[] {
    const dir = {
      path: resolvePath(import.meta.url, './locales'),
      namespace: config.defaultNamespace,
    };
    return this.resolveLocalesFromDir(dir.path).map((f) => ({
      locale: f.locale,
      ns: dir.namespace,
      path: f.path,
    }));
  }

  private collectDirectoryEntries(config: Required<I18nConfig>): ResourceEntry[] {
    const out: ResourceEntry[] = [];
    for (const dir of config.directories) {
      const namespace = dir.namespace ?? config.defaultNamespace;
      for (const f of this.resolveLocalesFromDir(resolvePath(process.cwd(), dir.path))) {
        out.push({ locale: f.locale, ns: namespace, path: f.path });
      }
    }
    return out;
  }

  private collectFileEntries(config: Required<I18nConfig>): ResourceEntry[] {
    return config.files.map((f) => ({
      locale: f.locale,
      ns: f.namespace ?? config.defaultNamespace,
      path: resolvePath(process.cwd(), f.path),
    }));
  }

  private resolveLocalesFromDir(dir: string): I18nFileEntry[] {
    const absolute = ensureDirectory(dir);
    const files = fs.readdirSync(absolute).filter((f) => f.endsWith('.json'));

    if (!files.length) throw new Error(`[i18n] No .json files in ${absolute}`);

    return files.map((file) => ({
      locale: file.replace(/\.json$/, ''),
      path: resolvePath(absolute, file),
    }));
  }
}
