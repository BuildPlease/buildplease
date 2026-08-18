import path from 'node:path';

import type {
  ArchicatGraphDependency,
  ArchicatSurface,
  ArchicatViolation,
  ResolvedArchicatProject,
} from '@src-internal/model';
import { isPathInside, makeRelativeDisplayPath, stripKnownExtension } from '@src-internal/path';
import { listTypeScriptFiles, scanImports } from '@src-internal/scanner';

export function validateProject(project: ResolvedArchicatProject): ArchicatViolation[] {
  const graph = makeDependencyGraph(project.graph.dependencies);
  const violations: ArchicatViolation[] = [];
  const sourceFiles = [
    ...project.definitions.flatMap((definition) => [
      ...(definition.api.rootPath ? listTypeScriptFiles(definition.api.rootPath) : []),
      ...(definition.impl.rootPath ? listTypeScriptFiles(definition.impl.rootPath) : []),
    ]),
    ...project.apps.flatMap((app) => listTypeScriptFiles(app.rootPath)),
  ];

  for (const filePath of sourceFiles) {
    const owner = findOwner(project, filePath);

    if (!owner) {
      continue;
    }

    for (const scannedImport of scanImports(filePath)) {
      const violation = validateImport(project, graph, owner, filePath, scannedImport.moduleSpecifier);

      if (violation) {
        violations.push(violation);
      }
    }
  }

  return violations;
}

export function formatViolation(violation: ArchicatViolation): string {
  return `${violation.filePath}\n  import: ${violation.importPath}\n  ${violation.message}`;
}

type SourceOwner = {
  kind: 'module' | 'library' | 'app';
  name: string;
  surface: ArchicatSurface | 'app';
  target: string;
};

interface AliasTarget {
  kind: 'module' | 'library';
  name: string;
  surface: ArchicatSurface;
  target: string;
}

type DependencyGraph = ReadonlyMap<string, readonly string[]>;

function validateImport(
  project: ResolvedArchicatProject,
  graph: DependencyGraph,
  owner: SourceOwner,
  filePath: string,
  importPath: string,
): ArchicatViolation | undefined {
  const unsupportedAlias = resolveUnsupportedArchicatAlias(project, importPath);

  if (unsupportedAlias) {
    return makeViolation(
      project,
      filePath,
      importPath,
      `Unsupported Archicat alias "${importPath}". Use an explicit file import under "${unsupportedAlias.apiAlias}/*" or "${unsupportedAlias.implAlias}/*".`,
    );
  }

  const target = resolveAlias(project, importPath);

  if (target) {
    if (isOwnApiImport(owner, target) || canReach(graph, owner.target, target.target)) {
      return undefined;
    }

    return makeViolation(
      project,
      filePath,
      importPath,
      `${formatOwner(owner)} imports "${target.target}" but does not declare a dependency that allows it.`,
    );
  }

  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return undefined;
  }

  const targetOwner = findOwner(project, resolveImportPath(filePath, importPath));

  if (!targetOwner || targetOwner.target === owner.target) {
    return undefined;
  }

  return makeViolation(
    project,
    filePath,
    importPath,
    `${formatOwner(owner)} imports ${formatOwner(targetOwner)} through a source path. Use an Archicat alias instead.`,
  );
}

function findOwner(project: ResolvedArchicatProject, filePath: string): SourceOwner | undefined {
  const extensionless = stripKnownExtension(filePath);

  for (const definition of project.definitions) {
    if (definition.api.rootPath && isPathInside(extensionless, stripKnownExtension(definition.api.rootPath))) {
      return {
        kind: definition.kind,
        name: definition.name,
        surface: 'api',
        target: definition.apiTarget,
      };
    }

    if (definition.impl.rootPath && isPathInside(extensionless, stripKnownExtension(definition.impl.rootPath))) {
      return {
        kind: definition.kind,
        name: definition.name,
        surface: 'impl',
        target: definition.implTarget,
      };
    }
  }

  for (const app of project.apps) {
    if (isPathInside(extensionless, stripKnownExtension(app.rootPath))) {
      return {
        kind: 'app',
        name: app.name,
        surface: 'app',
        target: app.target,
      };
    }
  }

  return undefined;
}

function resolveAlias(project: ResolvedArchicatProject, importPath: string): AliasTarget | undefined {
  for (const definition of project.definitions) {
    if (importPath.startsWith(`${definition.implAlias}/`)) {
      return {
        kind: definition.kind,
        name: definition.name,
        surface: 'impl',
        target: definition.implTarget,
      };
    }

    if (importPath.startsWith(`${definition.alias}/`)) {
      return {
        kind: definition.kind,
        name: definition.name,
        surface: 'api',
        target: definition.apiTarget,
      };
    }
  }

  return undefined;
}

function resolveUnsupportedArchicatAlias(
  project: ResolvedArchicatProject,
  importPath: string,
): { apiAlias: string; implAlias: string } | undefined {
  for (const definition of project.definitions) {
    const namespace = definition.kind === 'module' ? project.config.modules.alias : project.config.libraries.alias;
    const prefix = `${namespace}/${definition.name}`;
    const implAlias = definition.implAlias;

    if (importPath === prefix || importPath === definition.alias || importPath === implAlias) {
      return { apiAlias: definition.alias, implAlias: implAlias };
    }

    if (
      importPath.startsWith(`${prefix}/`) &&
      !importPath.startsWith(`${definition.alias}/`) &&
      !importPath.startsWith(`${implAlias}/`)
    ) {
      return { apiAlias: definition.alias, implAlias: implAlias };
    }
  }

  return undefined;
}

function isOwnApiImport(owner: SourceOwner, target: AliasTarget): boolean {
  return owner.kind === target.kind && owner.name === target.name && target.surface === 'api';
}

function makeDependencyGraph(dependencies: readonly ArchicatGraphDependency[]): DependencyGraph {
  const graph = new Map<string, string[]>();

  for (const dependency of dependencies) {
    const targets = graph.get(dependency.from) ?? [];
    targets.push(dependency.to);
    graph.set(dependency.from, targets);
  }

  return graph;
}

function canReach(graph: DependencyGraph, from: string, to: string): boolean {
  const visited = new Set<string>();
  const queue = [from];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      continue;
    }

    if (current === to) {
      return true;
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);
    queue.push(...(graph.get(current) ?? []));
  }

  return false;
}

function resolveImportPath(filePath: string, importPath: string): string {
  return stripKnownExtension(
    importPath.startsWith('/') ? importPath : path.resolve(path.dirname(filePath), importPath),
  );
}

function makeViolation(
  project: ResolvedArchicatProject,
  filePath: string,
  importPath: string,
  message: string,
): ArchicatViolation {
  return {
    filePath: makeRelativeDisplayPath(project.rootDir, filePath),
    importPath: importPath,
    message: message,
  };
}

function formatOwner(owner: SourceOwner): string {
  if (owner.kind === 'app') {
    return `App "${owner.name}"`;
  }

  return `${capitalize(owner.kind)} "${owner.name}" ${owner.surface}`;
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
