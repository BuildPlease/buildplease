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
   * Extracts the base language from an Accept-Language header.
   * Example: "sk-SK,sk;q=0.8" → "sk"
   */
  parseLocale(header?: string): string | undefined;
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

  public parseLocale(input?: string): string | undefined {
    if (!input) return undefined;
    const raw = input.split(',')[0]?.trim().toLowerCase();
    return raw ? raw.split('-')[0] : undefined;
  }

  private prepareConfig(): Required<I18nConfig> {
    const ext = this.configuration.i18n ?? {};

    // default namespace
    const defaultNS =
      typeof ext.defaultNamespace === 'string' ? ext.defaultNamespace : 'translation';

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
