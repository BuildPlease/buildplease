import path from 'node:path';

import { createDirectory, createFile, removePath, resolvePath } from '@meawkit/core/node';

export async function prepareGeneratedDirectory(outDir: string): Promise<string> {
  const outputPath = resolvePath(process.cwd(), outDir);

  if (outputPath === process.cwd()) throw new Error('Cannot use root directory as output path.');

  removePath(outputPath, { recursive: true, force: true });
  createDirectory(outputPath);

  return outputPath;
}

export async function generateBarrelExport(outputPath: string, generatedModules: string[]): Promise<void> {
  const exportStatements = generatedModules.map((moduleName) => `export * from './${moduleName}.js';`).join('\n');

  createFile(path.join(outputPath, 'index.ts'), exportStatements);
}
