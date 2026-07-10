import fs from 'node:fs';
import path from 'node:path';

import { createDirectory, createFile, ensureDirectory, resolvePath } from '@meawkit/core/node';

import type { ApiKitI18nResources } from '@/configuration/i18n';

import type { I18nGeneratorConfig, I18nGeneratorFileEntry } from '../configuration/i18n-generator-config';

type MutableI18nResources = Record<string, Record<string, unknown>>;

type ResourceEntry = {
  readonly locale: string;
  readonly path: string;
};

export async function generateI18n(config: I18nGeneratorConfig, outputPath: string): Promise<string[]> {
  const resources = await makeResources(config);
  const referenceResource = getReferenceResource(resources, config.defaultLanguage);
  const i18n = makeI18nTree(referenceResource, config);

  createFile(path.join(outputPath, 'i18n.ts'), makeI18nModule(i18n));

  if (!config.emitSource) return ['i18n'];

  writeResourceFiles(outputPath, resources);
  createFile(path.join(outputPath, 'resources.ts'), makeResourcesModule(resources));
  createFile(path.join(outputPath, 'source.ts'), makeSourceModule(config));

  return ['i18n', 'resources', 'source'];
}

async function makeResources(config: I18nGeneratorConfig): Promise<MutableI18nResources> {
  const resources: MutableI18nResources = {};

  if (config.includeBuiltinResources) {
    mergeResources(resources, await loadBuiltinResources(), 'builtin');
  }

  if (config.extends) {
    mergeResources(resources, config.extends.resources, 'extends');
  }

  const entries = collectResourceEntries(config);
  const localResources = mergeResourceEntries(entries);

  mergeResources(resources, localResources, 'local');

  return resources;
}

function collectResourceEntries(config: I18nGeneratorConfig): ResourceEntry[] {
  const directoryEntries = collectDirectoryEntries(config);
  const fileEntries = collectFileEntries(config);

  return [...directoryEntries, ...fileEntries].sort(compareResourceEntries);
}

async function loadBuiltinResources(): Promise<ApiKitI18nResources> {
  const moduleName = '@meawkit/apikit/i18n';
  const module = (await import(moduleName)) as { readonly resources?: ApiKitI18nResources };

  if (!module.resources) throw new Error('[ApiKit:I18n] Built-in generated resources were not found.');

  return module.resources;
}

function collectDirectoryEntries(config: I18nGeneratorConfig): ResourceEntry[] {
  const entries: ResourceEntry[] = [];

  for (const directory of config.directories) {
    const directoryPath = resolvePath(process.cwd(), directory.path);
    const files = resolveLocalesFromDir(directoryPath);

    for (const file of files) {
      entries.push({
        locale: file.locale,
        path: file.path,
      });
    }
  }

  return entries;
}

function collectFileEntries(config: I18nGeneratorConfig): ResourceEntry[] {
  return config.files.map((file) => ({
    locale: file.locale,
    path: resolvePath(process.cwd(), file.path),
  }));
}

function resolveLocalesFromDir(dir: string): I18nGeneratorFileEntry[] {
  const absolute = ensureDirectory(dir);
  const files = fs
    .readdirSync(absolute)
    .filter((file) => file.endsWith('.json'))
    .sort();

  if (!files.length) throw new Error(`[ApiKit:I18n] No .json files in ${absolute}`);

  return files.map((file) => ({
    locale: file.replace(/\.json$/, ''),
    path: resolvePath(absolute, file),
  }));
}

function mergeResourceEntries(entries: readonly ResourceEntry[]): MutableI18nResources {
  const resources: MutableI18nResources = {};

  for (const entry of entries) {
    const locale = normalizeLocale(entry.locale);
    const resource = readJson(entry.path);
    const target = (resources[locale] ??= {});

    mergeObject(target, resource, locale);
  }

  return resources;
}

function mergeResources(target: MutableI18nResources, source: ApiKitI18nResources, label: string): void {
  for (const locale of sortedKeys(source)) {
    const normalizedLocale = normalizeLocale(locale);
    const targetResource = (target[normalizedLocale] ??= {});

    mergeObject(targetResource, source[locale] as Record<string, unknown>, `${label}:${normalizedLocale}`);
  }
}

function mergeObject(target: Record<string, unknown>, source: Record<string, unknown>, _context: string): void {
  for (const key of sortedKeys(source)) {
    const value = source[key];
    const existing = target[key];

    if (isRecord(existing) && isRecord(value)) {
      mergeObject(existing, value, `${_context}.${key}`);
      continue;
    }

    target[key] = clone(value);
  }
}

function getReferenceResource(resources: MutableI18nResources, referenceLanguage: string): Record<string, unknown> {
  const locale = normalizeLocale(referenceLanguage);
  const resource = resources[locale];

  if (!resource) {
    throw new Error(`[ApiKit:I18n] No locale resources found for reference language "${referenceLanguage}".`);
  }

  return resource;
}

function readJson(filePath: string): Record<string, unknown> {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as unknown;

  if (!isRecord(parsed)) throw new Error(`[ApiKit:I18n] Locale file must contain a JSON object: ${filePath}`);

  return parsed;
}

function makeI18nTree(resource: Record<string, unknown>, config: I18nGeneratorConfig): Record<string, unknown> {
  const tree: Record<string, unknown> = {};

  const paths = flattenResourcePaths(resource, config.keySeparator);

  for (const key of paths) {
    const pathParts = key.split(config.keySeparator).map(toPascalCase);

    setGeneratedValue(tree, pathParts, key);
  }

  return tree;
}

function flattenResourcePaths(resource: Record<string, unknown>, keySeparator: string): string[] {
  const paths: string[] = [];

  collectPaths([], resource, paths, keySeparator);

  return paths.sort();
}

function collectPaths(prefix: string[], value: unknown, paths: string[], keySeparator: string): void {
  if (isRecord(value)) {
    for (const key of sortedKeys(value)) {
      collectPaths([...prefix, key], value[key], paths, keySeparator);
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
        throw new Error(`[ApiKit:I18n] Cannot overwrite i18n branch with key: ${pathParts.join('.')}`);
      if (typeof existing === 'string' && existing !== value)
        throw new Error(`[ApiKit:I18n] Duplicate generated i18n key: ${pathParts.join('.')}`);

      cursor[part] = value;
      return;
    }

    const existing = cursor[part];
    if (typeof existing === 'string')
      throw new Error(`[ApiKit:I18n] Cannot overwrite i18n key with branch: ${pathParts.join('.')}`);

    cursor = (cursor[part] ||= {}) as Record<string, unknown>;
  }
}

function makeI18nModule(i18n: Record<string, unknown>): string {
  return `// Generated by ApiKit. Do not edit manually.

export const I18n = ${formatObject(i18n)} as const;

export type I18nCode = DeepValue<typeof I18n>;

type DeepValue<T> = T extends object ? DeepValue<T[keyof T]> : T;
`;
}

function writeResourceFiles(outputPath: string, resources: MutableI18nResources): void {
  const resourcesPath = path.join(outputPath, 'resources');

  createDirectory(resourcesPath);

  for (const locale of sortedKeys(resources)) {
    createFile(
      path.join(resourcesPath, `${encodePathSegment(locale)}.json`),
      `${JSON.stringify(resources[locale], null, 2)}\n`,
    );
  }
}

function makeResourcesModule(resources: MutableI18nResources): string {
  const imports: string[] = [];
  const entries: Record<string, string> = {};

  for (const [index, locale] of sortedKeys(resources).entries()) {
    const importName = `resource_${index}`;
    const importPath = `./resources/${encodePathSegment(locale)}.json`;

    imports.push(`import ${importName} from '${importPath}';`);
    entries[locale] = importName;
  }

  return `// Generated by ApiKit. Do not edit manually.\n\n${imports.join('\n')}\n\nexport const resources = ${formatResourceImports(entries)} as const;\n`;
}

function formatResourceImports(entries: Record<string, string>, indent = 0): string {
  const lines: string[] = [];
  const pad = '  '.repeat(indent);
  const childPad = '  '.repeat(indent + 1);

  lines.push('{');

  for (const locale of sortedKeys(entries)) {
    lines.push(`${childPad}${formatPropertyKey(locale)}: ${entries[locale]},`);
  }

  lines.push(`${pad}}`);

  return lines.join('\n');
}

function makeSourceModule(config: I18nGeneratorConfig): string {
  const name = config.name ? `\n  name: ${JSON.stringify(config.name)},` : '';

  return `// Generated by ApiKit. Do not edit manually.\n\nimport { resources } from './resources.js';\n\nexport const i18n = {${name}\n  resources: resources,\n} as const;\n`;
}

function formatObject(value: unknown, indent = 0): string {
  if (typeof value === 'string') return JSON.stringify(value);
  if (!isRecord(value)) return JSON.stringify(value) ?? 'undefined';

  const entries = sortedKeys(value);
  if (!entries.length) return '{}';

  const pad = '  '.repeat(indent);
  const childPad = '  '.repeat(indent + 1);
  const lines = entries.map((key) => `${childPad}${formatPropertyKey(key)}: ${formatObject(value[key], indent + 1)},`);

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
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

function normalizeLocale(locale: string): string {
  return locale.toLowerCase().replace(/_/g, '-').trim();
}

function compareResourceEntries(a: ResourceEntry, b: ResourceEntry): number {
  return normalizeLocale(a.locale).localeCompare(normalizeLocale(b.locale)) || a.path.localeCompare(b.path);
}

function sortedKeys<T extends Record<string, unknown>>(value: T): string[] {
  return Object.keys(value).sort();
}

function clone(value: unknown): unknown {
  if (isRecord(value) || Array.isArray(value)) return JSON.parse(JSON.stringify(value)) as unknown;

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
