import fs from 'node:fs';
import path from 'node:path';

import { createFile, ensureDirectory, resolvePath } from '@meawkit/core/node';
import merge from 'lodash.merge';

import type { I18nGeneratorConfig, I18nGeneratorFileEntry } from '../configuration/i18n-generator-config';

type ResourceEntry = {
  readonly locale: string;
  readonly namespace: string;
  readonly path: string;
};

type NamespaceResource = {
  readonly namespace: string;
  readonly resource: Record<string, unknown>;
};

export async function generateI18n(config: I18nGeneratorConfig, outputPath: string): Promise<string[]> {
  const entries = collectReferenceResourceEntries(config);
  const resources = mergeResourceEntries(entries);
  const i18n = makeI18nTree(resources, config);

  createFile(path.join(outputPath, 'i18n.ts'), makeI18nModule(i18n));

  return ['i18n'];
}

function collectReferenceResourceEntries(config: I18nGeneratorConfig): ResourceEntry[] {
  const referenceLanguage = normalizeLocale(config.defaultLanguage);
  const entries = collectResourceEntries(config).filter((entry) => normalizeLocale(entry.locale) === referenceLanguage);

  if (!entries.length) {
    throw new Error(`[ApiKit:I18n] No locale resources found for default language "${config.defaultLanguage}".`);
  }

  return entries;
}

function collectResourceEntries(config: I18nGeneratorConfig): ResourceEntry[] {
  const builtinEntries = collectBuiltinEntries(config);
  const directoryEntries = collectDirectoryEntries(config);
  const fileEntries = collectFileEntries(config);

  return [...builtinEntries, ...directoryEntries, ...fileEntries];
}

function collectBuiltinEntries(config: I18nGeneratorConfig): ResourceEntry[] {
  return resolveLocalesFromDir(resolveBuiltinLocalesPath()).map((entry) => ({
    locale: entry.locale,
    namespace: config.defaultNamespace,
    path: entry.path,
  }));
}

function collectDirectoryEntries(config: I18nGeneratorConfig): ResourceEntry[] {
  const entries: ResourceEntry[] = [];

  for (const directory of config.directories) {
    const directoryPath = resolvePath(process.cwd(), directory.path);
    const files = resolveLocalesFromDir(directoryPath);

    for (const file of files) {
      entries.push({
        locale: file.locale,
        namespace: directory.namespace ?? config.defaultNamespace,
        path: file.path,
      });
    }
  }

  return entries;
}

function collectFileEntries(config: I18nGeneratorConfig): ResourceEntry[] {
  return config.files.map((file) => ({
    locale: file.locale,
    namespace: file.namespace ?? config.defaultNamespace,
    path: resolvePath(process.cwd(), file.path),
  }));
}

function resolveLocalesFromDir(dir: string): I18nGeneratorFileEntry[] {
  const absolute = ensureDirectory(dir);
  const files = fs.readdirSync(absolute).filter((file) => file.endsWith('.json'));

  if (!files.length) throw new Error(`[ApiKit:I18n] No .json files in ${absolute}`);

  return files.map((file) => ({
    locale: file.replace(/\.json$/, ''),
    path: resolvePath(absolute, file),
  }));
}

function resolveBuiltinLocalesPath(): string {
  const candidates = [
    resolvePath(import.meta.url, '../../src/i18n/locales'),
    resolvePath(import.meta.url, '../src/locales'),
    resolvePath(import.meta.url, '../src/i18n/locales'),
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (found) return found;

  throw new Error('[ApiKit:I18n] Built-in locale directory was not found.');
}

function mergeResourceEntries(entries: readonly ResourceEntry[]): NamespaceResource[] {
  const resources = new Map<string, Record<string, unknown>>();

  for (const entry of entries) {
    const resource = getOrCreate(resources, entry.namespace, () => ({}));
    merge(resource, readJson(entry.path));
  }

  return Array.from(resources.entries()).map(([namespace, resource]) => ({
    namespace,
    resource,
  }));
}

function readJson(filePath: string): Record<string, unknown> {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as unknown;

  if (!isRecord(parsed)) throw new Error(`[ApiKit:I18n] Locale file must contain a JSON object: ${filePath}`);

  return parsed;
}

function makeI18nTree(resources: readonly NamespaceResource[], config: I18nGeneratorConfig): Record<string, unknown> {
  const tree: Record<string, unknown> = {
    Messages: {},
    Errors: {},
  };

  for (const resource of resources) {
    const paths = flattenResourcePaths(resource.resource, config.keySeparator);

    for (const key of paths) {
      const value = makeI18nKey(resource.namespace, key, config);
      const pathParts = key.split(config.keySeparator).map(toPascalCase);

      setGeneratedValue(tree, pathParts, value);
    }
  }

  return tree;
}

function makeI18nKey(namespace: string, key: string, config: I18nGeneratorConfig): string {
  if (namespace === config.defaultNamespace) return key;

  return `${namespace}${config.nsSeparator}${key}`;
}

function flattenResourcePaths(resource: Record<string, unknown>, keySeparator: string): string[] {
  const paths: string[] = [];

  collectPaths([], resource, paths, keySeparator);

  return paths.sort();
}

function collectPaths(prefix: string[], value: unknown, paths: string[], keySeparator: string): void {
  if (isRecord(value)) {
    for (const [key, nested] of Object.entries(value)) {
      collectPaths([...prefix, key], nested, paths, keySeparator);
    }

    return;
  }

  paths.push(prefix.join(keySeparator));
}

function setGeneratedValue(target: Record<string, unknown>, pathParts: string[], value: string): void {
  let cursor = target;

  for (const [index, part] of pathParts.entries()) {
    const isLeaf = index === pathParts.length - 1;

    if (isLeaf) {
      const existing = cursor[part];
      if (isRecord(existing))
        throw new Error(`[ApiKit:I18n] Cannot overwrite i18n namespace with key: ${pathParts.join('.')}`);
      if (typeof existing === 'string' && existing !== value)
        throw new Error(`[ApiKit:I18n] Duplicate generated i18n key: ${pathParts.join('.')}`);

      cursor[part] = value;
      return;
    }

    const existing = cursor[part];
    if (typeof existing === 'string')
      throw new Error(`[ApiKit:I18n] Cannot overwrite i18n key with namespace: ${pathParts.join('.')}`);

    cursor = (cursor[part] ||= {}) as Record<string, unknown>;
  }
}

function makeI18nModule(i18n: Record<string, unknown>): string {
  return `// Generated by ApiKit. Do not edit manually.\n\nexport const I18n = ${formatObject(i18n)} as const;\n\nexport type I18nCode = DeepValue<typeof I18n>;\nexport type I18nMessageCode = DeepValue<typeof I18n.Messages>;\nexport type I18nErrorCode = DeepValue<typeof I18n.Errors>;\n\ntype DeepValue<T> = T extends object ? DeepValue<T[keyof T]> : T;\n`;
}

function formatObject(value: unknown, indent = 0): string {
  if (typeof value === 'string') return `'${escapeString(value)}'`;
  if (!isRecord(value)) return JSON.stringify(value);

  const entries = Object.entries(value);
  if (!entries.length) return '{}';

  const pad = '  '.repeat(indent);
  const childPad = '  '.repeat(indent + 1);
  const lines = entries.map(
    ([key, nested]) => `${childPad}${formatPropertyKey(key)}: ${formatObject(nested, indent + 1)},`,
  );

  return `{\n${lines.join('\n')}\n${pad}}`;
}

function toPascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');
}

function formatPropertyKey(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `'${escapeString(key)}'`;
}

function escapeString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function normalizeLocale(locale: string): string {
  return locale.toLowerCase().replace(/_/g, '-').trim();
}

function getOrCreate<K, V>(map: Map<K, V>, key: K, factory: () => V): V {
  const existing = map.get(key);
  if (existing) return existing;

  const value = factory();
  map.set(key, value);

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
