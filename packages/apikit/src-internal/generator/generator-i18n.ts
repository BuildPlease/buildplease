import type { ApiKitI18nGeneratorConfig } from './configuration/i18n-generator-config';
import { generateBarrelExport, prepareGeneratedDirectory } from './generator-output';
import { generateI18n } from './steps/generate-i18n';

export interface GenerateI18nInput {
  readonly generatorConfig: ApiKitI18nGeneratorConfig;
}

export async function generateApiKitI18n(input: GenerateI18nInput): Promise<void> {
  const outputPath = await prepareGeneratedDirectory(input.generatorConfig.build.outDir);
  const generatedModules = await generateI18n(input.generatorConfig.i18n, outputPath);

  await generateBarrelExport(outputPath, generatedModules);
}
