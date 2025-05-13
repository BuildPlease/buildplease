import fs from 'fs';

import { generateEnvironment, writeGeneratedFile } from './data';

import { resolvePath, ensureDirectory } from '#/utils';
import type { ApiKitConfig } from '#/configuration';

/**
 * Generate the application core.
 */
export async function generate(config: ApiKitConfig): Promise<void> {
  const defaultOutputPath = '.runtime';
  const outputPath = await prepareGeneratedDirectory(config.outDir ?? defaultOutputPath);
  const generatedFiles: string[] = [];

  const generatorMethods = [generateEnvironment];

  for (const generateMethod of generatorMethods) {
    generatedFiles.push(...(await generateMethod(config, outputPath)));
  }

  await generateBarrelExport(outputPath, generatedFiles);
}

async function prepareGeneratedDirectory(outDir: string): Promise<string> {
  const outputPath = resolvePath(process.cwd(), outDir);

  if (outputPath === process.cwd()) {
    throw new Error('Cannot use root directory as output path!');
  }

  if (fs.existsSync(outputPath)) {
    if (!fs.lstatSync(outputPath).isDirectory()) {
      throw new Error(`Output path ${outputPath} exists but is not a directory`);
    }

    fs.rmSync(outputPath, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 100,
    });
  }

  ensureDirectory(outputPath);

  return outputPath;
}

async function generateBarrelExport(outputPath: string, generatedFiles: string[]) {
  const exportStatements = generatedFiles.map((file) => `export * from './${file}';`).join('\n');

  await writeGeneratedFile(outputPath, 'index.ts', exportStatements);
}
