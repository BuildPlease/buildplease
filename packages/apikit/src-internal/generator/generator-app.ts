import type { ApiKitConfig } from '@/configuration';

import type { AppGeneratorConfig } from './configuration';
import { makeGeneratorOptions, prepareGeneratorOutput } from './generator-options';
import { generateBarrel, generateBuildMetadata, generateEnvironment } from './steps';

export interface GenerateAppInput {
  readonly config: ApiKitConfig;
  readonly generatorConfig: AppGeneratorConfig;
}

export async function generateApp(input: GenerateAppInput): Promise<void> {
  const options = makeGeneratorOptions(input.generatorConfig);
  prepareGeneratorOutput(options);

  const generatedModules = [
    ...(await generateBuildMetadata(options)),
    ...(await generateEnvironment(input.config.environments, options)),
  ];

  await generateBarrel(options, generatedModules);
}
