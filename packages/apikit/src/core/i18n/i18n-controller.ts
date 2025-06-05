import fs from 'node:fs';

import { inject, injectable } from 'inversify';
import type { InitOptions } from 'i18next';
import i18next from 'i18next';
import merge from 'lodash.merge';

import { ApiKitSymbols } from '#/di';
import { resolvePath, ensureDirectory } from '#/utils';
import type { ApiKitController, I18nConfig, I18nFileEntry } from '#/configuration';

type ResourceEntry = {
  locale: string;
  ns: string;
  path: string;
};

export interface I18nController {
  /** Initializes i18next with merged built-in and app-provided translations. */
  prepare(): Promise<void>;

  /**
   * Determines the client’s preferred base language from an Accept-Language header,
   * honoring quality values (q=) and falling back to the configured default language.
   *
   * @param input - Full Accept-Language header, e.g. `"fr-CA,fr;q=0.8,en-US;q=0.6,en;q=0.4"`
   * @returns The best matching base language code (e.g. `"fr"`, `"en"`)
   */
  parseLocale(input?: string): string | undefined;
}

@injectable()
export class I18nControllerImpl implements I18nController {
  constructor(
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    private readonly configuration: ApiKitController,
  ) {}

  public async prepare(): Promise<void> {
    const cfg = this.prepareConfig();
    const resources = this.makeResources(cfg);

    const initOptions: InitOptions = {
      lng: cfg.defaultLanguage,
      fallbackLng: cfg.fallbackLanguages,
      supportedLngs: cfg.supportedLanguages,
      load: cfg.load,
      nonExplicitSupportedLngs: cfg.nonExplicitSupportedLngs,
      preload: cfg.preload,
      lowerCaseLng: cfg.lowerCaseLng,
      cleanCode: cfg.cleanCode,

      ns: cfg.namespaces,
      defaultNS: cfg.defaultNamespace,

      keySeparator: cfg.keySeparator,
      nsSeparator: cfg.nsSeparator,
      pluralSeparator: cfg.pluralSeparator,
      contextSeparator: cfg.contextSeparator,

      debug: cfg.debug,
      resources,
    };

    await i18next.init(initOptions);
  }

  public parseLocale(input?: string): string {
    const { supportedLanguages, defaultLanguage } = this.prepareConfig();

    if (!input) {
      return defaultLanguage;
    }

    // MARK: 1 - parse and normalize into [{ lang, q }]
    const candidates = input.split(',').map((part) => {
      const [rawLang = '', qStr] = part.trim().split(';q=');
      const lang = rawLang.toLowerCase();
      const q = qStr !== undefined ? parseFloat(qStr) : 1;
      return { lang, q };
    });

    // MARK: 2 - sort by quality descending
    candidates.sort((a, b) => b.q - a.q);

    // MARK: 3 - pick the first supported base language
    for (const { lang } of candidates) {
      const [base = ''] = lang.split('-');
      if (supportedLanguages.includes(base)) {
        return base;
      }
    }

    // MARK: 4 - fallback
    return defaultLanguage;
  }

  private prepareConfig(): Required<I18nConfig> {
    const ext = this.configuration.i18n ?? {};

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
      lowerCaseLng: ext.lowerCaseLng ?? false,
      cleanCode: ext.cleanCode ?? false,

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

  private collectBuiltinEntries(cfg: Required<I18nConfig>): ResourceEntry[] {
    const dir = {
      path: resolvePath(import.meta.url, './locales'),
      namespace: cfg.defaultNamespace,
    };
    return this.resolveLocalesFromDir(dir.path).map((f) => ({
      locale: f.locale,
      ns: dir.namespace,
      path: f.path,
    }));
  }

  private collectDirectoryEntries(cfg: Required<I18nConfig>): ResourceEntry[] {
    const out: ResourceEntry[] = [];
    for (const dir of cfg.directories) {
      const namespace = dir.namespace ?? cfg.defaultNamespace;
      for (const f of this.resolveLocalesFromDir(resolvePath(process.cwd(), dir.path))) {
        out.push({ locale: f.locale, ns: namespace, path: f.path });
      }
    }
    return out;
  }

  private collectFileEntries(cfg: Required<I18nConfig>): ResourceEntry[] {
    return cfg.files.map((f) => ({
      locale: f.locale,
      ns: f.namespace ?? cfg.defaultNamespace,
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
