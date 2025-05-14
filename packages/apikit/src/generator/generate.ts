import { generateEnvironment } from './data';

import { resolvePath, removePath, createDirectory, createFile } from '#/utils';
import type { ApiKitConfig } from '#/configuration';

export async function generate(config: ApiKitConfig): Promise<void> {
  const defaultOutputPath = '.apikit';
  const outputPath = await prepareGeneratedDirectory(config.outDir ?? defaultOutputPath);
  const generatedFiles: string[] = [];

  const generatorMethods = [generateEnvironment];

  for (const gen of generatorMethods) {
    generatedFiles.push(...(await gen(config, outputPath)));
  }

  await generateBarrelExport(outputPath, generatedFiles);
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

async function generateBarrelExport(outputPath: string, generatedFiles: string[]) {
  const exportStatements = generatedFiles.map((file) => `export * from './${file}';`).join('\n');
  createFile(`${outputPath}/index.ts`, exportStatements);
}
