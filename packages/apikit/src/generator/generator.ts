import { prepareGeneratedDirectory, writeGeneratedFile } from './utils';

import { ApiKitConfig } from '@/core/defineConfig';

/**
 * Generate the application core.
 */
export async function generate(config: ApiKitConfig): Promise<void> {
  const outputPath = await prepareGeneratedDirectory(config.outDir);

  await generateEnvironmentFiles(config, outputPath);
}

/**
 * Dynamically generates the TypeScript environment file based on the configuration.
 */
async function generateEnvironmentFiles(
  config: ApiKitConfig,
  outputPath: string,
) {
  const { environments } = config;

  const environmentEnum = `export enum Environment {
    ${environments.map((env) => `${env.name} = "${env.name}"`).join(',\n')}
  }`;
  const environmentObject = `export const Environments = {
    ${environments
      .map(
        (env) =>
          `${env.name}: { name: Environment.${env.name}, file: "${env.file}", fileDir: "${env.fileDir || ''}" }`,
      )
      .join(',\n')}
  } as const;
  
  export type EnvironmentType = keyof typeof Environments;`;

  const environmentFileContent = `${environmentEnum}\n\n${environmentObject}`;

  await writeGeneratedFile(outputPath, environmentFileContent);
}
