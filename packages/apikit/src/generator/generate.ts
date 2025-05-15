import path from 'node:path';

import { generateEnvironment } from './data';

import type { ApiKitConfig } from '#/configuration';
import { resolvePath, removePath, createDirectory, createFile } from '#/utils';

export async function generate(config: ApiKitConfig): Promise<void> {
  const defaultOutputPath = '.apikit';
  const outputPath = await prepareGeneratedDirectory(config.outDir ?? defaultOutputPath);

  const generatedBases: string[] = [];

  generatedBases.push(...(await generateEnvironment(config, outputPath)));

  await generateBarrelExport(outputPath, generatedBases);
}

async function prepareGeneratedDirectory(outDir: string): Promise<string> {
  const outputPath = resolvePath(process.cwd(), outDir);

  if (outputPath === process.cwd()) {
    throw new Error('Cannot use root directory as output path!');
  }

  removePath(outputPath, { recursive: true, force: true });
  createDirectory(outputPath);

  return outputPath;
}

async function generateBarrelExport(outputPath: string, generatedBases: string[]) {
  const exportStatements = generatedBases.map((base) => `export * from './${base}.js';`).join('\n');

  createFile(path.join(outputPath, 'index.ts'), exportStatements);
}
