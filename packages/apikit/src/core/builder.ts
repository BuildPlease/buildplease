import fs from 'fs';
import path from 'path';

import { ApiKitConfig } from './defineConfig';

/**
 * Builds the API application for production.
 */
export async function build(config: ApiKitConfig): Promise<void> {
  const outputPath = prepareBuildDirectory(config.outDir);
  generateEnvironmentFiles(config, outputPath);
}

/**
 * Prepares the build output directory.
 */
function prepareBuildDirectory(outDir: string): string {
  const outputPath = path.resolve(process.cwd(), outDir);
  if (fs.existsSync(outputPath))
    fs.rmSync(outputPath, { recursive: true, force: true });
  fs.mkdirSync(outputPath, { recursive: true });
  return outputPath;
}

/**
 * Generates environment-related files.
 */
function generateEnvironmentFiles(config: ApiKitConfig, outputPath: string) {
  const { environments } = config;

  const environmentEnum = `export enum Environment {
${environments.map((env) => `  ${env.name} = "${env.name}"`).join(',\n')}
}

export const Environments = {
${environments
  .map(
    (env) =>
      `  ${env.name}: { name: Environment.${env.name}, file: "${env.file}", fileDir: "${env.fileDir || ''}" }`,
  )
  .join(',\n')}
} as const;

export type EnvironmentType = keyof typeof Environments;
`;

  const environmentRuntime = `import { Environment, Environments } from "./Environment";

const envName = process.env.APP_ENV as keyof typeof Environments;

if (!envName || !(envName in Environments)) {
  throw new Error(\`❌ Invalid or missing environment. Allowed: \${Object.keys(Environments).join(', ')}\`);
}

export const environment = { 
  ...Environments[envName], 
  filePath: \`\${process.cwd()}/\${Environments[envName].file}\`
};
`;

  fs.writeFileSync(path.join(outputPath, 'Environment.ts'), environmentEnum);
  fs.writeFileSync(path.join(outputPath, 'environment.ts'), environmentRuntime);
}
