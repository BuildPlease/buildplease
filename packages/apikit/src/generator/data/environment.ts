import { writeGeneratedFile } from './utils';

import type { ApiKitConfig } from '$/configuration/apikitConfig';

export async function generateEnvironment(
  config: ApiKitConfig,
  outputPath: string,
): Promise<string[]> {
  const { environments } = config;

  // Generate the enum for the environments
  const environmentEnum = `export enum Environment {
    ${environments.map((env) => `${env.name} = "${env.name}"`).join(',\n')}
  }`;

  // Generate the environment object with all environments
  const environmentObject = `export const Environments = {
    ${environments
      .map(
        (env) =>
          `${env.name}: { name: Environment.${env.name}, file: "${env.file}", fileDir: "${env.fileDir || ''}" }`,
      )
      .join(',\n')}
  } as const;
  
  export type EnvironmentType = keyof typeof Environments;`;

  const environmentFileContent = `${environmentEnum}\n\n${environmentObject}\n`;

  await writeGeneratedFile(
    outputPath,
    'environment.ts',
    environmentFileContent,
  );

  return ['environment.ts'];
}
