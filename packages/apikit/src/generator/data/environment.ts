import path from 'node:path';

import { createFile } from '#/file';
import type { ApiKitConfig } from '#/configuration';

export async function generateEnvironment(config: ApiKitConfig, outputPath: string): Promise<string[]> {
  const { environments } = config;

  // ENUM with single quotes
  const environmentEnum = `export enum Environment {
${environments.map((env) => `  ${env.name} = '${env.name}',`).join('\n')}
}`;

  // OBJECT with single quotes
  const environmentObject = `export const Environments = {
${environments
  .map(
    (env) =>
      `  ${env.name}: { name: Environment.${env.name}, file: '${env.file}', fileDir: '${env.fileDir ?? ''}' },`,
  )
  .join('\n')}
} as const;

export type EnvironmentType = keyof typeof Environments;`;

  const content = `${environmentEnum}\n\n${environmentObject}\n`;

  const baseName = 'environment';
  const filename = `${baseName}.ts`;
  const fullPath = path.join(outputPath, filename);
  createFile(fullPath, content);

  return [baseName];
}
