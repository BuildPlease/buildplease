import fs from 'node:fs';
import path from 'node:path';

import { createDirectory, createFile, ensureDirectory, resolvePath } from '@meawkit/core/node';

import type { ApiKitI18nResources } from '@/configuration/i18n';

import type { I18nGenerationConfig, I18nGeneratorFileEntry } from '../configuration/i18n-generator-config';
import type { GeneratorOptions, GeneratorWriter } from '../generator-options';

type MutableI18nResources = Record<string, Record<string, unknown>>;

type ResourceEntry = {
  readonly locale: string;
  readonly path: string;
};

export async function generateI18nModules(
  i18nConfig: I18nGenerationConfig,
  options: GeneratorOptions,
): Promise<string[]> {
  const resources = await makeResources(i18nConfig);
  const referenceResource = getReferenceResource(resources, i18nConfig.defaultLanguage);
  const i18n = makeI18nTree(referenceResource, i18nConfig);

  writeI18nModule(i18n, options);

  if (!i18nConfig.emitSource) return ['i18n'];

  writeResourceFiles(options.outputPath, resources);
  writeResourcesModule(resources, options);
  writeSourceModule(i18nConfig, options);

  return ['i18n', 'resources', 'source'];
}

async function makeResources(config: I18nGenerationConfig): Promise<MutableI18nResources> {
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

function collectResourceEntries(config: I18nGenerationConfig): ResourceEntry[] {
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

function collectDirectoryEntries(config: I18nGenerationConfig): ResourceEntry[] {
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

function collectFileEntries(config: I18nGenerationConfig): ResourceEntry[] {
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

function makeI18nTree(resource: Record<string, unknown>, config: I18nGenerationConfig): Record<string, unknown> {
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

function writeI18nModule(i18n: Record<string, unknown>, options: GeneratorOptions): void {
  const writer = new options.writer();

  writer.writeLine('// Generated by ApiKit. Do not edit manually.');
  writer.blankLine();
  writer.write('export const I18n = ');
  writeObject(writer, i18n);
  writer.write(' as const;').newLine();
  writer.blankLine();
  writer.writeLine('export type I18nCode = DeepValue<typeof I18n>;');
  writer.blankLine();
  writer.writeLine('type DeepValue<T> = T extends object ? DeepValue<T[keyof T]> : T;');

  createFile(path.join(options.outputPath, 'i18n.ts'), writer.toString());
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

function writeResourcesModule(resources: MutableI18nResources, options: GeneratorOptions): void {
  const writer = new options.writer();
  const entries: Record<string, string> = {};

  writer.writeLine('// Generated by ApiKit. Do not edit manually.');
  writer.blankLine();

  for (const [index, locale] of sortedKeys(resources).entries()) {
    const importName = `resource_${index}`;
    const importPath = `./resources/${encodePathSegment(locale)}.json`;

    writer.write(`import ${importName} from `).quote(importPath).writeLine(';');
    entries[locale] = importName;
  }

  writer.blankLine();
  writer.write('export const resources = ');
  writeResourceImports(writer, entries);
  writer.write(' as const;').newLine();

  createFile(path.join(options.outputPath, 'resources.ts'), writer.toString());
}

function writeResourceImports(writer: GeneratorWriter, entries: Record<string, string>): void {
  writer.inlineBlock(() => {
    for (const locale of sortedKeys(entries)) {
      writePropertyKey(writer, locale);
      writer.write(`: ${entries[locale]}`).writeLine(',');
    }
  });
}

function writeSourceModule(i18nConfig: I18nGenerationConfig, options: GeneratorOptions): void {
  const writer = new options.writer();

  writer.writeLine('// Generated by ApiKit. Do not edit manually.');
  writer.blankLine();
  writer.writeLine(`import { resources } from './resources.js';`);
  writer.blankLine();
  writer.writeLine('export const i18n = {');
  writer.indent(() => {
    if (i18nConfig.name) {
      writer.write('name: ').quote(i18nConfig.name).writeLine(',');
    }

    writer.writeLine('resources: resources,');
  });
  writer.writeLine('} as const;');

  createFile(path.join(options.outputPath, 'source.ts'), writer.toString());
}

function writeObject(writer: GeneratorWriter, value: unknown): void {
  if (typeof value === 'string') {
    writer.quote(value);
    return;
  }

  if (!isRecord(value)) {
    writer.write(JSON.stringify(value) ?? 'undefined');
    return;
  }

  const entries = sortedKeys(value);
  if (!entries.length) {
    writer.write('{}');
    return;
  }

  writer.inlineBlock(() => {
    for (const key of entries) {
      writePropertyKey(writer, key);
      writer.write(': ');
      writeObject(writer, value[key]);
      writer.writeLine(',');
    }
  });
}

function toPascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');
}

function writePropertyKey(writer: GeneratorWriter, key: string): void {
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) {
    writer.write(key);
    return;
  }

  writer.quote(key);
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
