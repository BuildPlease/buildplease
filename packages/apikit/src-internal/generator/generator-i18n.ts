import type { I18nGeneratorConfig } from './configuration';
import { makeGeneratorOptions } from './generator-options';
import { generateBarrel, generateI18nModules } from './steps';

export interface GenerateI18nInput {
  readonly generatorConfig: I18nGeneratorConfig;
}

export async function generateI18n(input: GenerateI18nInput): Promise<void> {
  const options = makeGeneratorOptions(input.generatorConfig);
  const generatedModules = await generateI18nModules(input.generatorConfig.i18n, options);

  await generateBarrel(options, generatedModules);
}
