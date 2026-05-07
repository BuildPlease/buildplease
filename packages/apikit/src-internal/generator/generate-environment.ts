import path from 'node:path';

import { createFile } from '@meawkit/core/node';

import type { ApiKitConfig } from '@/configuration';

// MARK: - Public

export async function generateEnvironment(config: ApiKitConfig, outputPath: string): Promise<string[]> {
  const entries = Object.entries(config.environments);

  const environmentEnum = `export enum Environment {
${entries.map(([name]) => `  ${name} = '${name}',`).join('\n')}
}`;

  const environmentObject = `export const Environments = {
${entries
  .map(([name, env]) => {
    const fileDir = env.fileDir ?? '';
    return `  ${name}: { name: Environment.${name}, file: '${env.file}', fileDir: '${fileDir}' },`;
  })
  .join('\n')}
} as const;

export type EnvironmentType = keyof typeof Environments;`;

  const content = `${environmentEnum}\n\n${environmentObject}\n`;

  const baseName = 'environment';
  createFile(path.join(outputPath, `${baseName}.ts`), content);

  return [baseName];
}
