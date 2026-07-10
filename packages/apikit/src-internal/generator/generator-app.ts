import type { ApiKitConfig } from '@/configuration';

import type { AppGeneratorConfig } from './configuration/app-generator-config';
import { generateBarrelExport, prepareGeneratedDirectory } from './generator-output';
import { generateEnvironment } from './steps/generate-environment';
import { generateI18n } from './steps/generate-i18n';

export interface GenerateAppInput {
  readonly config: ApiKitConfig;
  readonly generatorConfig: AppGeneratorConfig;
}

export async function generateApp(input: GenerateAppInput): Promise<void> {
  const outputPath = await prepareGeneratedDirectory(input.generatorConfig.build.outDir);
  const generatedModules = [
    ...(await generateEnvironment(input.config.environments, outputPath)),
    ...(await generateI18n(input.generatorConfig.i18n, outputPath)),
  ];

  await generateBarrelExport(outputPath, generatedModules);
}
