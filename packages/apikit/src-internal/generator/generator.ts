import path from 'node:path';

import { createDirectory, createFile, removePath, resolvePath } from '@meawkit/core/node';

import type { ApiKitConfig } from '@/configuration';
import { getBuildOutDir } from '@/configuration/core/build-config';

import { generateEnvironment } from './generate-environment';

// MARK: - Public

export async function generate(config: ApiKitConfig): Promise<void> {
  const outputPath = await prepareGeneratedDirectory(getBuildOutDir(config));

  const generatedBases: string[] = [];

  generatedBases.push(...(await generateEnvironment(config, outputPath)));

  await generateBarrelExport(outputPath, generatedBases);
}

// MARK: - Private

async function prepareGeneratedDirectory(outDir: string): Promise<string> {
  const outputPath = resolvePath(process.cwd(), outDir);

  if (outputPath === process.cwd()) throw new Error('Cannot use root directory as output path.');

  removePath(outputPath, { recursive: true, force: true });
  createDirectory(outputPath);

  return outputPath;
}

async function generateBarrelExport(outputPath: string, generatedBases: string[]): Promise<void> {
  const exportStatements = generatedBases.map((base) => `export * from './${base}.js';`).join('\n');

  createFile(path.join(outputPath, 'index.ts'), exportStatements);
}
