import fs from 'node:fs';
import path from 'node:path';

import { ArchicatDefaults } from '@src-internal/configuration';
import type { DependencyOwner } from '@src-internal/dependency-graph';
import { assertNoDependencyCycles, validateDeclaredDependency } from '@src-internal/dependency-graph';
import type {
  ArchicatGraphDependency,
  ArchicatGraphTarget,
  LoadedArchicatApp,
  LoadedArchicatConfig,
  LoadedArchicatDefinition,
  LoadedArchicatLibrary,
  LoadedArchicatModule,
  ResolvedArchicatApp,
  ResolvedArchicatDefinition,
  ResolvedArchicatLibrary,
  ResolvedArchicatModule,
  ResolvedArchicatProject,
  ResolvedArchicatSurface,
} from '@src-internal/model';

// MARK: - Project resolving

export function resolveArchicatProject(
  loadedConfig: LoadedArchicatConfig,
  loadedDefinitions: readonly LoadedArchicatDefinition[],
): ResolvedArchicatProject {
  const modules = loadedDefinitions
    .filter((definition): definition is LoadedArchicatModule => definition.kind === 'module')
    .map((definition) => resolveModule(loadedConfig, definition));
  const libraries = loadedDefinitions
    .filter((definition): definition is LoadedArchicatLibrary => definition.kind === 'library')
    .map((definition) => resolveLibrary(loadedConfig, definition));
  const apps = loadedDefinitions
    .filter((definition): definition is LoadedArchicatApp => definition.kind === 'app')
    .map((definition) => resolveApp(definition));
  const definitions: ResolvedArchicatDefinition[] = [...modules, ...libraries];

  assertUniqueDefinitionNames([...definitions, ...apps]);
  const graph = buildGraph(definitions, apps);
  assertDependencyReferences(definitions, apps, graph.targets);
  assertNoDependencyCycles(graph.dependencies);

  return {
    rootDir: loadedConfig.rootDir,
    outDir: loadedConfig.outDir,
    reportsDir: loadedConfig.reportsDir,
    ...(loadedConfig.tsconfigPath ? { tsconfigPath: loadedConfig.tsconfigPath } : {}),
    configFilePath: loadedConfig.configFilePath,
    config: loadedConfig.resolvedConfig,
    modules: modules,
    libraries: libraries,
    apps: apps,
    definitions: definitions,
    graph: graph,
  };
}

// MARK: - Definition resolving

function resolveModule(loadedConfig: LoadedArchicatConfig, loadedModule: LoadedArchicatModule): ResolvedArchicatModule {
  const { contract, contractFilePath, definitionDir } = loadedModule;

  assertValidName(contract.name, contractFilePath, 'module');

  const apiRootPath = contract.api.root
    ? resolveDeclaredRoot(definitionDir, contract.api.root, 'api', contract.name)
    : undefined;
  const implRootPath = contract.impl.root
    ? resolveDeclaredRoot(definitionDir, contract.impl.root, 'impl', contract.name)
    : undefined;
  const aliasBase = `${loadedConfig.resolvedConfig.modules.alias}/${contract.name}`;
  const apiAlias = `${aliasBase}/api`;
  const implAlias = `${aliasBase}/impl`;

  return {
    kind: 'module',
    name: contract.name,
    apiTarget: `module.${contract.name}.api`,
    implTarget: `module.${contract.name}.impl`,
    alias: apiAlias,
    aliasGlob: `${apiAlias}/*`,
    implAlias: implAlias,
    implAliasGlob: `${implAlias}/*`,
    contractFilePath: contractFilePath,
    definitionDir: definitionDir,
    api: resolveSurface(
      apiRootPath,
      contract.api.dependencies,
      path.join(loadedConfig.outDir, ArchicatDefaults.generated.modulesDirName, contract.name, 'api'),
    ),
    impl: resolveSurface(
      implRootPath,
      contract.impl.dependencies,
      path.join(loadedConfig.outDir, ArchicatDefaults.generated.modulesDirName, contract.name, 'impl'),
    ),
  };
}

function resolveLibrary(
  loadedConfig: LoadedArchicatConfig,
  loadedLibrary: LoadedArchicatLibrary,
): ResolvedArchicatLibrary {
  const { contract, contractFilePath, definitionDir } = loadedLibrary;

  assertValidName(contract.name, contractFilePath, 'library');

  const apiRootPath = contract.api.root
    ? resolveDeclaredRoot(definitionDir, contract.api.root, 'api', contract.name)
    : undefined;
  const implRootPath = contract.impl.root
    ? resolveDeclaredRoot(definitionDir, contract.impl.root, 'impl', contract.name)
    : undefined;
  const aliasBase = `${loadedConfig.resolvedConfig.libraries.alias}/${contract.name}`;
  const apiAlias = `${aliasBase}/api`;
  const implAlias = `${aliasBase}/impl`;

  return {
    kind: 'library',
    name: contract.name,
    apiTarget: `library.${contract.name}.api`,
    implTarget: `library.${contract.name}.impl`,
    alias: apiAlias,
    aliasGlob: `${apiAlias}/*`,
    implAlias: implAlias,
    implAliasGlob: `${implAlias}/*`,
    contractFilePath: contractFilePath,
    definitionDir: definitionDir,
    api: resolveSurface(
      apiRootPath,
      contract.api.dependencies,
      path.join(loadedConfig.outDir, ArchicatDefaults.generated.librariesDirName, contract.name, 'api'),
    ),
    impl: resolveSurface(
      implRootPath,
      contract.impl.dependencies,
      path.join(loadedConfig.outDir, ArchicatDefaults.generated.librariesDirName, contract.name, 'impl'),
    ),
  };
}

function resolveApp(loadedApp: LoadedArchicatApp): ResolvedArchicatApp {
  const { contract, contractFilePath, definitionDir } = loadedApp;

  assertValidName(contract.name, contractFilePath, 'app');

  return {
    kind: 'app',
    name: contract.name,
    target: `app.${contract.name}`,
    contractFilePath: contractFilePath,
    definitionDir: definitionDir,
    rootPath: contract.root ? resolveDeclaredRoot(definitionDir, contract.root, 'app', contract.name) : definitionDir,
    dependencies: [...contract.dependencies],
  };
}

function resolveSurface(
  rootPath: string | undefined,
  dependencies: readonly string[],
  mirrorRootPath: string,
): ResolvedArchicatSurface {
  return {
    ...(rootPath ? { rootPath: rootPath } : {}),
    mirrorRootPath: mirrorRootPath,
    dependencies: [...dependencies],
  };
}

function resolveDeclaredRoot(
  definitionDir: string,
  relativeRoot: string,
  kind: 'api' | 'impl' | 'app',
  name: string,
): string {
  const resolved = path.resolve(definitionDir, relativeRoot);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Definition "${name}" declares ${kind} root that does not exist: ${resolved}`);
  }

  if (!fs.statSync(resolved).isDirectory()) {
    throw new Error(`Definition "${name}" declares ${kind} root that is not a directory: ${resolved}`);
  }

  return resolved;
}

// MARK: - Project graph assembly

function buildGraph(
  definitions: readonly ResolvedArchicatDefinition[],
  apps: readonly ResolvedArchicatApp[],
): {
  targets: ArchicatGraphTarget[];
  dependencies: ArchicatGraphDependency[];
} {
  const targets = definitions.flatMap((definition): ArchicatGraphTarget[] => [
    { key: definition.apiTarget, kind: definition.kind, name: definition.name, surface: 'api' },
    { key: definition.implTarget, kind: definition.kind, name: definition.name, surface: 'impl' },
  ]);

  const declaredDependencies = [
    ...definitions.flatMap((definition) => [
      ...definition.api.dependencies.map((dependency) => ({
        from: definition.apiTarget,
        to: dependency,
        origin: 'declared' as const,
      })),
      ...definition.impl.dependencies.map((dependency) => ({
        from: definition.implTarget,
        to: dependency,
        origin: 'declared' as const,
      })),
    ]),
    ...apps.flatMap((app) =>
      app.dependencies.map((dependency) => ({ from: app.target, to: dependency, origin: 'declared' as const })),
    ),
  ];

  const derivedDependencies = definitions.map((definition) => ({
    from: definition.implTarget,
    to: definition.apiTarget,
    origin: 'derived' as const,
  }));

  return {
    targets: targets,
    dependencies: [...derivedDependencies, ...declaredDependencies],
  };
}

// MARK: - Project validation

function assertValidName(name: string, filePath: string, kind: string): void {
  if (!/^[a-z][a-z0-9-]*$/u.test(name)) {
    throw new Error(`Invalid Archicat ${kind} name "${name}" in ${filePath}. Use ^[a-z][a-z0-9-]*$`);
  }
}

function assertUniqueDefinitionNames(definitions: readonly (ResolvedArchicatDefinition | ResolvedArchicatApp)[]): void {
  const seen = new Map<string, string>();

  for (const definition of definitions) {
    const key = `${definition.kind}.${definition.name}`;
    const current = seen.get(key);

    if (current) {
      throw new Error(
        `Duplicate Archicat ${definition.kind} name "${definition.name}" in ${current} and ${definition.contractFilePath}`,
      );
    }

    seen.set(key, definition.contractFilePath);
  }
}

function assertDependencyReferences(
  definitions: readonly ResolvedArchicatDefinition[],
  apps: readonly ResolvedArchicatApp[],
  targets: readonly ArchicatGraphTarget[],
): void {
  const targetKeys = new Set(targets.map((target) => target.key));

  for (const definition of definitions) {
    for (const dependency of definition.api.dependencies) {
      validateDeclaredDependency(makeOwner(definition, 'api'), dependency, targetKeys);
    }

    for (const dependency of definition.impl.dependencies) {
      validateDeclaredDependency(makeOwner(definition, 'impl'), dependency, targetKeys);
    }
  }

  for (const app of apps) {
    for (const dependency of app.dependencies) {
      validateDeclaredDependency(
        { kind: 'app', name: app.name, surface: 'app', target: app.target },
        dependency,
        targetKeys,
      );
    }
  }
}

function makeOwner(definition: ResolvedArchicatDefinition, surface: 'api' | 'impl'): DependencyOwner {
  return {
    kind: definition.kind,
    name: definition.name,
    surface: surface,
    target: surface === 'api' ? definition.apiTarget : definition.implTarget,
  };
}
