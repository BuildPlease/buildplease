import path from 'node:path';

import { createFile } from '@meawkit/core/node';

import type { EnvironmentRegistry } from '@/configuration';

export async function generateEnvironment(environments: EnvironmentRegistry, outputPath: string): Promise<string[]> {
  const entries = Object.entries(environments);

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

  const moduleName = 'environment';
  createFile(path.join(outputPath, `${moduleName}.ts`), content);

  return [moduleName];
}
