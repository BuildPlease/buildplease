export interface ApiKitI18nDirectoryEntry {
  readonly path: string;
}

export interface ApiKitI18nFileEntry {
  readonly locale: string;
  readonly path: string;
}

export type ApiKitI18nLocaleResource = {
  readonly [key: string]: unknown;
};

export type ApiKitI18nResources = {
  readonly [locale: string]: ApiKitI18nLocaleResource;
};

export interface ApiKitI18nSource {
  readonly name?: string;
  readonly resources: ApiKitI18nResources;
}

export interface ApiKitI18nBuildConfig {
  readonly outDir?: string;
}

export interface ApiKitI18nResourcesConfig {
  readonly directories?: readonly ApiKitI18nDirectoryEntry[];
  readonly files?: readonly ApiKitI18nFileEntry[];
}

export interface DefineApiKitI18nInput {
  readonly name?: string;
  readonly extends?: ApiKitI18nSource;
  readonly build?: ApiKitI18nBuildConfig;
  readonly resources?: ApiKitI18nResourcesConfig;
  readonly referenceLanguage?: string;
}

export interface ApiKitI18nConfig extends DefineApiKitI18nInput {
  readonly build: ApiKitI18nBuildConfig;
  readonly resources: ApiKitI18nResourcesConfig;
}
