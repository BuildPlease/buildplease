import path from 'node:path';

import { loadArchicatBuildContext } from '@src-internal/context';
import type {
  ArchicatSurface,
  ArchicatViolation,
  ResolvedArchicatApp,
  ResolvedArchicatDefinition,
  ResolvedArchicatProject,
} from '@src-internal/model';
import { isPathInside, makeRelativeDisplayPath, stripKnownExtension } from '@src-internal/path';
import { listTypeScriptFiles, scanImports } from '@src-internal/scanner';

// MARK: - Import validation

export async function validate(cwd: string, configFileName?: string): Promise<ArchicatViolation[]> {
  const project = await loadArchicatBuildContext(cwd, configFileName);
  return validateProject(project);
}

export function validateProject(project: ResolvedArchicatProject): ArchicatViolation[] {
  return validateImports(project);
}

export function formatViolation(violation: ArchicatViolation): string {
  return `${violation.filePath}\n  import: ${violation.importPath}\n  ${violation.message}`;
}

// MARK: - Validation model

type SourceOwner =
  | {
      kind: 'module' | 'library';
      name: string;
      surface: ArchicatSurface;
      target: string;
      definition: ResolvedArchicatDefinition;
    }
  | {
      kind: 'app';
      name: string;
      surface: 'app';
      target: string;
      app: ResolvedArchicatApp;
    };

interface AliasTarget {
  kind: 'module' | 'library';
  name: string;
  surface: ArchicatSurface;
  target: string;
}

// MARK: - Import rule checks

function validateImports(project: ResolvedArchicatProject): ArchicatViolation[] {
  const violations: ArchicatViolation[] = [];
  const sourceFiles = [
    ...project.definitions.flatMap((definition) => getDefinitionSourceFiles(definition)),
    ...project.apps.flatMap((app) => listTypeScriptFiles(app.rootPath)),
  ];

  for (const filePath of sourceFiles) {
    const owner = findOwner(project, filePath);

    if (!owner) {
      continue;
    }

    for (const scannedImport of scanImports(filePath)) {
      const violation = validateImport(project, owner, filePath, scannedImport.moduleSpecifier);

      if (violation) {
        violations.push(violation);
      }
    }
  }

  return violations;
}

function getDefinitionSourceFiles(definition: ResolvedArchicatDefinition): string[] {
  return [
    ...(definition.api.rootPath ? listTypeScriptFiles(definition.api.rootPath) : []),
    ...(definition.impl.rootPath ? listTypeScriptFiles(definition.impl.rootPath) : []),
  ];
}

function validateImport(
  project: ResolvedArchicatProject,
  owner: SourceOwner,
  filePath: string,
  importPath: string,
): ArchicatViolation | undefined {
  const unsupportedArchicatAlias = resolveUnsupportedArchicatAlias(project, importPath);

  if (unsupportedArchicatAlias) {
    return makeViolation(
      project,
      filePath,
      importPath,
      `Unsupported Archicat alias "${importPath}". Use an explicit file import under "${unsupportedArchicatAlias.apiAlias}/*" or "${unsupportedArchicatAlias.implAlias}/*".`,
    );
  }

  const targetAlias = resolveAlias(project, importPath);

  if (targetAlias) {
    if (isOwnApiImport(owner, targetAlias)) {
      return undefined;
    }

    if (!canReach(project, owner.target, targetAlias.target)) {
      return makeViolation(
        project,
        filePath,
        importPath,
        `${formatOwner(owner)} imports "${targetAlias.target}" but does not declare a dependency that allows it.`,
      );
    }

    return undefined;
  }

  if (importPath.startsWith('.') || importPath.startsWith('/')) {
    return validateRelativeImport(project, owner, filePath, importPath);
  }

  return undefined;
}

function validateRelativeImport(
  project: ResolvedArchicatProject,
  owner: SourceOwner,
  filePath: string,
  importPath: string,
): ArchicatViolation | undefined {
  const targetPath = resolveImportPath(filePath, importPath);
  const targetOwner = findOwner(project, targetPath);

  if (!targetOwner || isSameTarget(owner, targetOwner)) {
    return undefined;
  }

  return makeViolation(
    project,
    filePath,
    importPath,
    `${formatOwner(owner)} imports ${formatOwner(targetOwner)} through a source path. Use an Archicat alias instead.`,
  );
}

// MARK: - Import owner resolving

function findOwner(project: ResolvedArchicatProject, filePath: string): SourceOwner | undefined {
  const extensionless = stripKnownExtension(filePath);

  for (const definition of project.definitions) {
    if (definition.api.rootPath && isPathInside(extensionless, stripKnownExtension(definition.api.rootPath))) {
      return {
        kind: definition.kind,
        name: definition.name,
        surface: 'api',
        target: definition.apiTarget,
        definition: definition,
      };
    }

    if (definition.impl.rootPath && isPathInside(extensionless, stripKnownExtension(definition.impl.rootPath))) {
      return {
        kind: definition.kind,
        name: definition.name,
        surface: 'impl',
        target: definition.implTarget,
        definition: definition,
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
        app: app,
      };
    }
  }

  return undefined;
}

function resolveImportPath(filePath: string, importPath: string): string {
  return stripKnownExtension(
    importPath.startsWith('/') ? importPath : path.resolve(path.dirname(filePath), importPath),
  );
}

function isSameTarget(left: SourceOwner, right: SourceOwner): boolean {
  return left.target === right.target;
}

// MARK: - Alias resolving

function resolveAlias(project: ResolvedArchicatProject, importPath: string): AliasTarget | undefined {
  for (const definition of project.definitions) {
    if (definition.implAlias && importPath.startsWith(`${definition.implAlias}/`)) {
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
    const implAlias = definition.implAlias ?? `${prefix}/impl`;

    if (importPath === prefix || importPath === definition.alias || importPath === implAlias) {
      return {
        apiAlias: definition.alias,
        implAlias: implAlias,
      };
    }

    if (
      importPath.startsWith(`${prefix}/`) &&
      !importPath.startsWith(`${definition.alias}/`) &&
      !importPath.startsWith(`${implAlias}/`)
    ) {
      return {
        apiAlias: definition.alias,
        implAlias: implAlias,
      };
    }
  }

  return undefined;
}

function isOwnApiImport(owner: SourceOwner, target: AliasTarget): boolean {
  return owner.kind === target.kind && owner.name === target.name && target.surface === 'api';
}

// MARK: - Graph lookups

function canReach(project: ResolvedArchicatProject, from: string, to: string): boolean {
  const visited = new Set<string>();
  const queue = [from];

  while (queue.length > 0) {
    const current = queue.shift() as string;

    if (current === to) {
      return true;
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    for (const dependency of project.graph.dependencies.filter((candidate) => candidate.from === current)) {
      queue.push(dependency.to);
    }
  }

  return false;
}

// MARK: - Diagnostics formatting

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
