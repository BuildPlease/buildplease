import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { writeFile } from '#test/fixtures/files';

export interface TestProjectConfig {
  readonly root?: string;
  readonly outDir?: string;
  readonly modulesInclude?: readonly string[];
  readonly modulesAlias?: string;
  readonly librariesInclude?: readonly string[];
  readonly librariesAlias?: string;
  readonly appsInclude?: readonly string[];
  readonly alias?: Readonly<Record<string, string>>;
  readonly typescript?: {
    readonly tsConfig?: {
      readonly extends?: string;
      readonly include?: readonly string[];
      readonly exclude?: readonly string[];
      readonly files?: readonly string[];
      readonly compilerOptions?: Record<string, unknown>;
    };
  };
}

export interface TestProjectOptions {
  readonly config?: TestProjectConfig;
  readonly baseTsconfig?: string;
  readonly consumerTsconfig?: string;
}

export interface DefinitionOptions {
  readonly name: string;
  readonly api?: false;
  readonly impl?: false;
  readonly apiDependencies?: readonly string[];
  readonly implDependencies?: readonly string[];
  readonly apiIndex?: string;
  readonly implIndex?: string;
}

export interface AppOptions {
  readonly name: string;
  readonly dependencies?: readonly string[];
  readonly index?: string;
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'archicat-test-'));

const defaultTypeScriptConfig = {
  tsConfig: {
    extends: './tsconfig.base.json',
    include: ['src'],
  },
} as const;

const defaultBaseTsconfig = `
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true
  }
}
`;

const defaultConsumerTsconfig = `
{
  "extends": "./.archicat/tsconfig.json"
}
`;

export function createTestProject(name: string, options: TestProjectOptions = {}): string {
  const root = fs.mkdtempSync(path.join(tmpRoot, `${name}-`));

  writeFile(path.join(root, 'archicat.config.ts'), makeConfig(options.config ?? {}));
  writeFile(path.join(root, 'tsconfig.base.json'), options.baseTsconfig ?? defaultBaseTsconfig);
  writeFile(path.join(root, 'tsconfig.json'), options.consumerTsconfig ?? defaultConsumerTsconfig);

  return root;
}

export function createModule(root: string, options: DefinitionOptions): string {
  return createDefinition(root, 'module', options);
}

export function createLibrary(root: string, options: DefinitionOptions): string {
  return createDefinition(root, 'library', options);
}

export function createApp(root: string, options: AppOptions): string {
  const directory = path.join(root, 'src/apps', options.name);

  writeFile(path.join(directory, 'index.ts'), options.index ?? `export const testApp = '${options.name}';`);
  writeFile(
    path.join(directory, 'archicat.app.ts'),
    `
      export default {
        kind: 'app',
        name: '${options.name}',
        root: './',
        dependencies: ${JSON.stringify(options.dependencies ?? [])},
      };
    `,
  );

  return directory;
}

export function cleanupTestProjects(): void {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

function createDefinition(root: string, kind: 'module' | 'library', options: DefinitionOptions): string {
  const collection = kind === 'module' ? 'modules' : 'libraries';
  const directory = path.join(root, 'src', collection, options.name);
  const api = makeSurface('api', options.api !== false, options.apiDependencies ?? []);
  const impl = makeSurface('impl', options.impl !== false, options.implDependencies ?? []);

  if (options.api !== false) {
    writeFile(path.join(directory, 'api/index.ts'), options.apiIndex ?? `export const testApi = '${options.name}';`);
  }

  if (options.impl !== false) {
    writeFile(path.join(directory, 'impl/index.ts'), options.implIndex ?? `export const testImpl = '${options.name}';`);
  }

  writeFile(
    path.join(directory, kind === 'module' ? 'archicat.module.ts' : 'archicat.library.ts'),
    `
      export default {
        kind: '${kind}',
        name: '${options.name}',
        api: ${api},
        impl: ${impl},
      };
    `,
  );

  return directory;
}

function makeSurface(root: 'api' | 'impl', enabled: boolean, dependencies: readonly string[]): string {
  if (!enabled) {
    return `{ dependencies: ${JSON.stringify(dependencies)} }`;
  }

  return `{ root: './${root}', dependencies: ${JSON.stringify(dependencies)} }`;
}

function makeConfig(config: TestProjectConfig): string {
  const modules = compact({
    include: config.modulesInclude,
    alias: config.modulesAlias,
  });
  const libraries = compact({
    include: config.librariesInclude,
    alias: config.librariesAlias,
  });
  const apps = compact({ include: config.appsInclude });
  const value = compact({
    root: config.root,
    outDir: config.outDir,
    typescript: config.typescript ?? defaultTypeScriptConfig,
    alias: config.alias,
    modules: Object.keys(modules).length > 0 ? modules : undefined,
    libraries: Object.keys(libraries).length > 0 ? libraries : undefined,
    apps: Object.keys(apps).length > 0 ? apps : undefined,
  });

  return `export default ${JSON.stringify(value, null, 2)};`;
}

function compact<T extends Record<string, unknown>>(value: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
}
