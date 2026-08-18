import path from 'node:path';

import { writeTextFile } from '@src-internal/generator/file-writer';
import type {
  ResolvedArchicatDefinition,
  ResolvedArchicatLibrary,
  ResolvedArchicatModule,
  ResolvedArchicatSurface,
} from '@src-internal/model';
import { normalizePath, toPosixRelativeImport } from '@src-internal/path';
import { hasDefaultExport, listTypeScriptFiles } from '@src-internal/scanner';

// MARK: - Mirror generation

export function generateMirrors(definitions: readonly ResolvedArchicatDefinition[]): void {
  for (const definition of definitions) {
    switch (definition.kind) {
      case 'module':
        generateModuleMirror(definition);
        break;
      case 'library':
        generateLibraryMirror(definition);
        break;
    }
  }
}

// MARK: - Mirror file formatting

function generateModuleMirror(module: ResolvedArchicatModule): void {
  generateApiMirror(module.api);
  generateImplMirror(module, 'module');
}

function generateLibraryMirror(library: ResolvedArchicatLibrary): void {
  generateApiMirror(library.api);
  generateImplMirror(library, 'library');
}

function generateApiMirror(surface: ResolvedArchicatSurface): void {
  if (!surface.rootPath) {
    writeEmptyMirror(path.join(surface.mirrorRootPath, 'index.ts'));
    return;
  }

  const apiFiles = listTypeScriptFiles(surface.rootPath);
  const mirroredRelativePaths = new Set<string>();

  for (const sourceFilePath of apiFiles) {
    const relativePath = normalizePath(path.relative(surface.rootPath, sourceFilePath));
    mirroredRelativePaths.add(relativePath);
    writeMirrorFile(path.join(surface.mirrorRootPath, relativePath), sourceFilePath);
  }

  if (!mirroredRelativePaths.has('index.ts')) {
    writeEmptyMirror(path.join(surface.mirrorRootPath, 'index.ts'));
  }
}

function generateImplMirror(
  definition: ResolvedArchicatModule | ResolvedArchicatLibrary,
  kind: 'module' | 'library',
): void {
  const implIndexPath = definition.impl.rootPath ? findIndexFile(definition.impl.rootPath) : undefined;

  if (!implIndexPath) {
    writeNoOpImplementationMirror(definition, kind);
    return;
  }

  writeMirrorFile(path.join(definition.impl.mirrorRootPath, 'index.ts'), implIndexPath);
}

function writeNoOpImplementationMirror(
  definition: ResolvedArchicatModule | ResolvedArchicatLibrary,
  kind: 'module' | 'library',
): void {
  const constName = kind === 'module' ? 'ArchicatModuleImplementation' : 'ArchicatLibraryImplementation';
  const content = `${makeMirrorHeader()}
export const ${constName} = {
  name: '${definition.name}',
  assemblies: [],
  schemas: [],
  routes: [],
} as const;

export default ${constName};
`;

  writeTextFile(path.join(definition.impl.mirrorRootPath, 'index.ts'), content);
}

function writeEmptyMirror(filePath: string): void {
  writeTextFile(
    filePath,
    `${makeMirrorHeader()}export {};
`,
  );
}

function writeMirrorFile(targetFilePath: string, sourceFilePath: string): void {
  const sourceImport = toPosixRelativeImport(targetFilePath, sourceFilePath);
  const defaultExport = hasDefaultExport(sourceFilePath) ? `export { default } from '${sourceImport}';\n` : '';
  const content = `${makeMirrorHeader()}
export * from '${sourceImport}';
${defaultExport}`;

  writeTextFile(targetFilePath, content);
}

function findIndexFile(rootPath: string): string | undefined {
  const candidates = ['index.ts', 'index.mts', 'index.cts', 'index.tsx'];

  for (const candidate of candidates) {
    const candidatePath = path.join(rootPath, candidate);

    if (listTypeScriptFiles(candidatePath).length > 0) {
      return candidatePath;
    }
  }

  return undefined;
}

function makeMirrorHeader(): string {
  return '// Mirrored by Archicat.\n';
}
