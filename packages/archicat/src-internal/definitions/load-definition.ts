import path from 'node:path';

import type {
  LoadedArchicatApp,
  LoadedArchicatDefinition,
  LoadedArchicatLibrary,
  LoadedArchicatModule,
} from '@src-internal/model';
import { createJiti } from 'jiti';

import type {
  ArchicatAppContract,
  ArchicatLibraryContract,
  ArchicatModuleContract,
  ArchicatSurfaceContract,
} from '@/configs';

// MARK: - Definition loading

export async function loadArchicatDefinition(
  filePath: string,
  kind: 'module' | 'library' | 'app',
): Promise<LoadedArchicatDefinition> {
  switch (kind) {
    case 'module':
      return loadArchicatModule(filePath);
    case 'library':
      return loadArchicatLibrary(filePath);
    case 'app':
      return loadArchicatApp(filePath);
  }
}

async function loadArchicatModule(filePath: string): Promise<LoadedArchicatModule> {
  const contract = await importDefault<ArchicatModuleContract>(filePath, path.dirname(filePath));
  assertArchicatDefinition(contract, filePath, 'module');

  return {
    kind: 'module',
    contractFilePath: filePath,
    definitionDir: path.dirname(filePath),
    contract: contract,
  };
}

async function loadArchicatLibrary(filePath: string): Promise<LoadedArchicatLibrary> {
  const contract = await importDefault<ArchicatLibraryContract>(filePath, path.dirname(filePath));
  assertArchicatDefinition(contract, filePath, 'library');

  return {
    kind: 'library',
    contractFilePath: filePath,
    definitionDir: path.dirname(filePath),
    contract: contract,
  };
}

async function loadArchicatApp(filePath: string): Promise<LoadedArchicatApp> {
  const contract = await importDefault<ArchicatAppContract>(filePath, path.dirname(filePath));
  assertArchicatDefinition(contract, filePath, 'app');

  return {
    kind: 'app',
    contractFilePath: filePath,
    definitionDir: path.dirname(filePath),
    contract: contract,
  };
}

// MARK: - Definition import

async function importDefault<T>(filePath: string, rootDir: string): Promise<T> {
  const jiti = createJiti(rootDir, {
    interopDefault: true,
    extensions: ['.js', '.cjs', '.mjs', '.ts', '.cts', '.mts', '.json'],
  });

  const imported = await jiti.import(filePath, { default: true });
  return imported as T;
}

// MARK: - Definition validation

function assertArchicatDefinition(
  input: unknown,
  filePath: string,
  expectedKind: 'module' | 'library' | 'app',
): asserts input is ArchicatModuleContract | ArchicatLibraryContract | ArchicatAppContract {
  if (input == null || typeof input !== 'object') {
    throw new Error(`Invalid Archicat ${expectedKind} definition: ${filePath}`);
  }

  const definition = input as Partial<ArchicatModuleContract | ArchicatLibraryContract | ArchicatAppContract>;

  if (definition.kind !== expectedKind) {
    throw new Error(`Archicat ${expectedKind} file must export a ${expectedKind} definition: ${filePath}`);
  }

  if (typeof definition.name !== 'string' || definition.name.trim() === '') {
    throw new Error(`Archicat ${expectedKind} must define a non-empty name: ${filePath}`);
  }

  if (expectedKind === 'app') {
    assertOptionalNonEmptyString((definition as Partial<ArchicatAppContract>).root, 'root', filePath);
    assertDependencyArray((definition as Partial<ArchicatAppContract>).dependencies, filePath, expectedKind);
    return;
  }

  const surfaced = definition as Partial<ArchicatModuleContract | ArchicatLibraryContract>;
  assertSurface(surfaced.api, 'api', filePath, expectedKind);
  assertSurface(surfaced.impl, 'impl', filePath, expectedKind);
}

function assertSurface(
  surface: ArchicatSurfaceContract<string> | undefined,
  surfaceName: 'api' | 'impl',
  filePath: string,
  definitionKind: string,
): void {
  if (surface == null || typeof surface !== 'object') {
    throw new Error(`Archicat ${definitionKind}.${surfaceName} must be a surface object: ${filePath}`);
  }

  assertOptionalNonEmptyString(surface.root, `${surfaceName}.root`, filePath);
  assertDependencyArray(surface.dependencies, filePath, `${definitionKind}.${surfaceName}`);
}

function assertDependencyArray(value: unknown, filePath: string, owner: string): void {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string' || entry.trim() === '')) {
    throw new Error(`Archicat ${owner} dependencies must be an array of non-empty strings: ${filePath}`);
  }
}

function assertOptionalNonEmptyString(value: unknown, key: string, filePath: string): void {
  if (value !== undefined && (typeof value !== 'string' || value.trim() === '')) {
    throw new Error(`Archicat ${key} must be a non-empty string when defined: ${filePath}`);
  }
}
