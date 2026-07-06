export interface I18nGeneratorDirectoryEntry {
  readonly path: string;
  readonly namespace?: string;
}

export interface I18nGeneratorFileEntry {
  readonly locale: string;
  readonly path: string;
  readonly namespace?: string;
}

export interface I18nGeneratorConfig {
  readonly directories: readonly I18nGeneratorDirectoryEntry[];
  readonly files: readonly I18nGeneratorFileEntry[];
  readonly defaultLanguage: string;
  readonly defaultNamespace: string;
  readonly nsSeparator: string;
  readonly keySeparator: string;
}
