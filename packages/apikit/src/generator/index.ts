import fs from 'fs';
import path from 'path';

import { generateEnvironment, writeGeneratedFile } from './data';

import type { ApiKitConfig } from '$/configuration/defineConfig';

/**
 * Generate the application core.
 */
export async function generate(config: ApiKitConfig): Promise<void> {
  const outputPath = await prepareGeneratedDirectory(config.outDir);
  const generatedFiles: string[] = [];

  const generatorMethods = [generateEnvironment];

  for (const generateMethod of generatorMethods) {
    generatedFiles.push(...(await generateMethod(config, outputPath)));
  }

  await generateBarrelExport(outputPath, generatedFiles);
}

async function prepareGeneratedDirectory(outDir: string): Promise<string> {
  const outputPath = path.resolve(process.cwd(), outDir);

  if (fs.existsSync(outputPath)) {
    fs.rmSync(outputPath, { recursive: true, force: true });
  }

  fs.mkdirSync(outputPath, { recursive: true });

  return outputPath;
}

async function generateBarrelExport(
  outputPath: string,
  generatedFiles: string[],
) {
  const exportStatements = generatedFiles
    .map((file) => `export * from './${file.replace('.ts', '')}';`)
    .join('\n');

  await writeGeneratedFile(outputPath, 'index.ts', exportStatements);
}
