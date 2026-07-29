import type { ApiKitConfig } from '@/configuration';

import type { AppGeneratorConfig } from './configuration';
import { makeGeneratorOptions } from './generator-options';
import { generateBarrel, generateBuildMetadata, generateEnvironment, generateI18nModules } from './steps';

export interface GenerateAppInput {
  readonly config: ApiKitConfig;
  readonly generatorConfig: AppGeneratorConfig;
}

export async function generateApp(input: GenerateAppInput): Promise<void> {
  const options = makeGeneratorOptions(input.generatorConfig);

  const generatedModules = [
    ...(await generateBuildMetadata(options)),
    ...(await generateEnvironment(input.config.environments, options)),
    ...(await generateI18nModules(input.generatorConfig.i18n, options)),
  ];

  await generateBarrel(options, generatedModules);
}
