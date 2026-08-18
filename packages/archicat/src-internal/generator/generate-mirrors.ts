import fs from 'node:fs';
import path from 'node:path';

import { writeTextFile } from '@src-internal/generator/file-writer';
import type { ResolvedArchicatDefinition, ResolvedArchicatSurface } from '@src-internal/model';
import { normalizePath, toPosixRelativeImport } from '@src-internal/path';
import { hasDefaultExport, listTypeScriptFiles } from '@src-internal/scanner';

export function generateMirrors(definitions: readonly ResolvedArchicatDefinition[]): void {
  for (const definition of definitions) {
    generateApiMirror(definition.api);
    generateImplMirror(definition);
  }
}

function generateApiMirror(surface: ResolvedArchicatSurface): void {
  if (!surface.rootPath) {
    writeEmptyMirror(path.join(surface.mirrorRootPath, 'index.ts'));
    return;
  }

  const mirroredPaths = new Set<string>();

  for (const sourceFilePath of listTypeScriptFiles(surface.rootPath)) {
    const relativePath = normalizePath(path.relative(surface.rootPath, sourceFilePath));
    mirroredPaths.add(relativePath);
    writeMirrorFile(path.join(surface.mirrorRootPath, relativePath), sourceFilePath);
  }

  if (!mirroredPaths.has('index.ts')) {
    writeEmptyMirror(path.join(surface.mirrorRootPath, 'index.ts'));
  }
}

function generateImplMirror(definition: ResolvedArchicatDefinition): void {
  const indexPath = definition.impl.rootPath ? findIndexFile(definition.impl.rootPath) : undefined;

  if (indexPath) {
    writeMirrorFile(path.join(definition.impl.mirrorRootPath, 'index.ts'), indexPath);
    return;
  }

  const constName = definition.kind === 'module' ? 'ArchicatModuleImplementation' : 'ArchicatLibraryImplementation';
  const content = `${makeMirrorHeader()}
export const ${constName} = {
  name: '${definition.name}',
} as const;

export default ${constName};
`;

  writeTextFile(path.join(definition.impl.mirrorRootPath, 'index.ts'), content);
}

function writeEmptyMirror(filePath: string): void {
  writeTextFile(filePath, `${makeMirrorHeader()}export {};\n`);
}

function writeMirrorFile(targetFilePath: string, sourceFilePath: string): void {
  const sourceImport = toPosixRelativeImport(targetFilePath, sourceFilePath);
  const defaultExport = hasDefaultExport(sourceFilePath) ? `export { default } from '${sourceImport}';\n` : '';

  writeTextFile(
    targetFilePath,
    `${makeMirrorHeader()}
export * from '${sourceImport}';
${defaultExport}`,
  );
}

function findIndexFile(rootPath: string): string | undefined {
  for (const fileName of ['index.ts', 'index.mts', 'index.cts', 'index.tsx']) {
    const filePath = path.join(rootPath, fileName);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return filePath;
    }
  }

  return undefined;
}

function makeMirrorHeader(): string {
  return '// Mirrored by Archicat.\n';
}
