import { writeGeneratedFile } from './utils';

import { ApiKitConfig } from '@/core/defineConfig';

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

  // Add the getCurrentEnvironment function to check for invalid environments
  const getCurrentEnvironmentFunction = `
/**
 * Get the current environment.
 * This will stop the application execution if the environment is invalid.
 */
export function getCurrentEnvironment(): Environment {
  const currentEnv = process.env.APP_ENV

  if (!currentEnv || !Environments[currentEnv]) {
    console.error(\`Invalid environment: \${currentEnv}\`);
    process.exit(1);
  }

  return Environment[currentEnv as keyof typeof Environment];
}
  `;

  const environmentFileContent = `${environmentEnum}\n\n${environmentObject}\n\n${getCurrentEnvironmentFunction}`;

  await writeGeneratedFile(
    outputPath,
    'environment.ts',
    environmentFileContent,
  );

  return ['environment.ts'];
}
