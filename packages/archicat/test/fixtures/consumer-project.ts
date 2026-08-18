import fs from 'node:fs';
import path from 'node:path';

import { writeFile } from '#test/fixtures/files';
import { archicatPackageRoot, tmpRoot } from '#test/fixtures/paths';

// MARK: - Types

export interface ConsumerProjectOptions {
  readonly config?: ConsumerProjectConfig;
  readonly tsconfigBase?: string;
  readonly tsconfigNode?: string;
}

export interface ConsumerProjectConfig {
  readonly root?: string;
  readonly outDir?: string;
  readonly modulesInclude?: readonly string[];
  readonly modulesAlias?: string;
  readonly librariesInclude?: readonly string[];
  readonly librariesAlias?: string;
  readonly appsInclude?: readonly string[];
  readonly typescript?: {
    readonly tsConfig?: {
      readonly extends?: string;
      readonly include?: readonly string[];
      readonly exclude?: readonly string[];
      readonly files?: readonly string[];
      readonly compilerOptions?: Record<string, unknown>;
    };
  };
  readonly alias?: Record<string, string>;
}

export interface DefinitionFixtureOptions {
  readonly name: string;
  readonly api?: false;
  readonly impl?: false;
  readonly apiDependencies?: readonly string[];
  readonly implDependencies?: readonly string[];
  readonly dependencies?: readonly string[];
  readonly apiIndex?: string;
  readonly implIndex?: string;
}

export interface AppFixtureOptions {
  readonly name: string;
  readonly dependencies?: readonly string[];
  readonly index?: string;
}

// MARK: - Fixture defaults

const ARCHICAT_CONFIG_FILE_NAME = 'archicat.config.ts';
const CONSUMER_TSCONFIG_FILE_NAME = 'tsconfig.json';

const DEFAULT_TYPESCRIPT_CONFIG = Object.freeze({
  tsConfig: Object.freeze({
    extends: './tsconfig.base.json',
    include: Object.freeze(['src'] as const),
  }),
});

const DEFAULT_BASE_TSCONFIG = `
  {
    "compilerOptions": {
      "target": "ES2024",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "strict": true
    }
  }
`;

const ROOT_TSCONFIG = `
  {
    "extends": "./.archicat/tsconfig.json"
  }
`;

// MARK: - Fixture builders

export function createConsumerProject(name: string, options: ConsumerProjectOptions = {}): string {
  fs.mkdirSync(tmpRoot, { recursive: true });

  const root = fs.mkdtempSync(path.join(tmpRoot, `${name}-`));

  linkArchicatPackage(root);
  writeRootConfig(root, options.config ?? {});
  writeTsconfig(root, options);

  return root;
}

export function createModule(root: string, options: DefinitionFixtureOptions): string {
  const name = options.name;
  const moduleDir = path.join(root, 'src/modules', name);
  const fields = [`name: '${name}'`];

  if (options.api !== false) {
    fields.push(`api: ${makeSurface('./api', options.apiDependencies ?? [])}`);
    writeFile(
      path.join(moduleDir, 'api/index.ts'),
      options.apiIndex ?? `export const ${toIdentifier(name)}Api = '${name}';`,
    );
  }

  if (options.impl !== false) {
    fields.push(`impl: ${makeSurface('./impl', options.implDependencies ?? options.dependencies ?? [])}`);
    writeFile(
      path.join(moduleDir, 'impl/index.ts'),
      options.implIndex ?? `export const ${toIdentifier(name)}Impl = '${name}';`,
    );
  }

  writeDefinitionFile(path.join(moduleDir, 'archicat.module.ts'), 'defineModule', fields);
  return moduleDir;
}

export function createLibrary(root: string, options: DefinitionFixtureOptions): string {
  const name = options.name;
  const libraryDir = path.join(root, 'src/libraries', name);
  const fields = [`name: '${name}'`];

  if (options.api !== false) {
    fields.push(`api: ${makeSurface('./api', options.apiDependencies ?? [])}`);
    writeFile(
      path.join(libraryDir, 'api/index.ts'),
      options.apiIndex ?? `export const ${toIdentifier(name)}Library = '${name}';`,
    );
  }

  if (options.impl !== false) {
    fields.push(`impl: ${makeSurface('./impl', options.implDependencies ?? options.dependencies ?? [])}`);
    writeFile(
      path.join(libraryDir, 'impl/index.ts'),
      options.implIndex ?? `export const ${toIdentifier(name)}LibraryImpl = '${name}';`,
    );
  }

  writeDefinitionFile(path.join(libraryDir, 'archicat.library.ts'), 'defineLibrary', fields);
  return libraryDir;
}

export function createApp(root: string, options: AppFixtureOptions): string {
  const name = options.name;
  const appDir = path.join(root, 'src/apps', name);
  const fields = [`name: '${name}'`, `root: './'`];

  if (options.dependencies?.length) {
    fields.push(`dependencies: [${options.dependencies.map((dependency) => `'${dependency}'`).join(', ')}]`);
  }

  writeFile(path.join(appDir, 'index.ts'), options.index ?? `export const ${toIdentifier(name)}App = '${name}';`);
  writeDefinitionFile(path.join(appDir, 'archicat.app.ts'), 'defineApp', fields);

  return appDir;
}

export function cleanupConsumerProjects(): void {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

// MARK: - Fixture file writing

function linkArchicatPackage(root: string): void {
  const packageScopeDir = path.join(root, 'node_modules/@buildplease');
  const linkPath = path.join(packageScopeDir, 'archicat');

  fs.mkdirSync(packageScopeDir, { recursive: true });
  fs.rmSync(linkPath, { recursive: true, force: true });
  fs.symlinkSync(archicatPackageRoot, linkPath, 'junction');
}

function writeRootConfig(root: string, config: ConsumerProjectConfig): void {
  writeFile(path.join(root, ARCHICAT_CONFIG_FILE_NAME), makeRootConfig(config));
}

function writeTsconfig(root: string, options: ConsumerProjectOptions): void {
  writeFile(path.join(root, 'tsconfig.base.json'), options.tsconfigBase ?? DEFAULT_BASE_TSCONFIG);

  if (options.tsconfigNode !== undefined) {
    writeFile(path.join(root, 'tsconfig.node.json'), options.tsconfigNode);
  }

  writeFile(path.join(root, CONSUMER_TSCONFIG_FILE_NAME), ROOT_TSCONFIG);
}

function writeDefinitionFile(filePath: string, factoryName: string, fields: readonly string[]): void {
  writeFile(
    filePath,
    `
    import { ${factoryName} } from '@buildplease/archicat';

    export default ${factoryName}({
      ${fields.join(',\n      ')},
    });
  `,
  );
}

// MARK: - Config formatting

function makeRootConfig(config: ConsumerProjectConfig): string {
  const moduleFields = [
    ...(config.modulesInclude ? [`include: ${JSON.stringify(config.modulesInclude)}`] : []),
    ...(config.modulesAlias ? [`alias: '${config.modulesAlias}'`] : []),
  ];
  const libraryFields = [
    ...(config.librariesInclude ? [`include: ${JSON.stringify(config.librariesInclude)}`] : []),
    ...(config.librariesAlias ? [`alias: '${config.librariesAlias}'`] : []),
  ];
  const fields = [
    ...(config.root ? [`root: '${config.root}'`] : []),
    ...(config.outDir ? [`outDir: '${config.outDir}'`] : []),
    `typescript: ${formatValue(config.typescript ?? DEFAULT_TYPESCRIPT_CONFIG)}`,
    ...makeOptionalField('alias', config.alias, true),
    ...(moduleFields.length ? [`modules: { ${moduleFields.join(', ')} }`] : []),
    ...(libraryFields.length ? [`libraries: { ${libraryFields.join(', ')} }`] : []),
    ...(config.appsInclude ? [`apps: { include: ${JSON.stringify(config.appsInclude)} }`] : []),
  ];

  return `
    import { defineArchicatConfig } from '@buildplease/archicat';

    export default defineArchicatConfig({
      ${fields.join(',\n      ')},
    });
  `;
}

function makeOptionalField(key: string, value: Record<string, string> | undefined, quoteKeys: boolean): string[] {
  return value ? [`${key}: ${formatObjectLiteral(value, quoteKeys)}`] : [];
}

function formatObjectLiteral(value: Record<string, string>, quoteKeys = false): string {
  return JSON.stringify(value, null, 8).replace(/"([^"\\]+)":/gu, quoteKeys ? "'$1':" : '$1:');
}

function formatValue(value: unknown): string {
  return JSON.stringify(value, null, 8);
}

// MARK: - Definition formatting

function makeSurface(root: string, dependencies: readonly string[]): string {
  if (!dependencies.length) {
    return `'${root}'`;
  }

  return `{ root: '${root}', dependencies: [${dependencies.map((dependency) => `'${dependency}'`).join(', ')}] }`;
}

function toIdentifier(value: string): string {
  return value.replace(/-([a-z0-9])/gu, (_, char: string) => char.toUpperCase());
}
