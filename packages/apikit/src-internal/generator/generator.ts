import path from 'node:path';

import { createDirectory, createFile, removePath, resolvePath } from '@meawkit/core/node';

import type { ApiKitConfig } from '@/configuration';

import type { ApiKitGeneratorConfig } from './configuration/generator-config';
import { generateEnvironment } from './steps/generate-environment';
import { generateI18n } from './steps/generate-i18n';

export interface ApiKitGenerateInput {
  readonly config: ApiKitConfig;
  readonly generatorConfig: ApiKitGeneratorConfig;
}

interface ApiKitGeneratorStep {
  readonly name: string;
  run(outputPath: string): Promise<string[]>;
}

export async function generate(input: ApiKitGenerateInput): Promise<void> {
  const outputPath = await prepareGeneratedDirectory(input.generatorConfig.build.outDir);
  const generatedModules: string[] = [];

  for (const step of makeGeneratorSteps(input)) {
    const modules = await step.run(outputPath);
    generatedModules.push(...modules);
  }

  await generateBarrelExport(outputPath, generatedModules);
}

function makeGeneratorSteps(input: ApiKitGenerateInput): ApiKitGeneratorStep[] {
  return [
    {
      name: 'environment',
      run: (outputPath) => generateEnvironment(input.config.environments, outputPath),
    },
    {
      name: 'i18n',
      run: (outputPath) => generateI18n(input.generatorConfig.i18n, outputPath),
    },
  ];
}

async function prepareGeneratedDirectory(outDir: string): Promise<string> {
  const outputPath = resolvePath(process.cwd(), outDir);

  if (outputPath === process.cwd()) throw new Error('Cannot use root directory as output path.');

  removePath(outputPath, { recursive: true, force: true });
  createDirectory(outputPath);

  return outputPath;
}

async function generateBarrelExport(outputPath: string, generatedModules: string[]): Promise<void> {
  const exportStatements = generatedModules.map((moduleName) => `export * from './${moduleName}.js';`).join('\n');

  createFile(path.join(outputPath, 'index.ts'), exportStatements);
}
