import fs from 'fs';
import path from 'path';

import { ApiKitConfig } from './defineConfig';

/**
 * Builds the API application for production.
 */
export async function build(config: ApiKitConfig): Promise<void> {
  const outputPath = prepareBuildDirectory(config.outDir);

  makeEnvironments(config, outputPath);
}

/**
 * Prepares the build output directory by clearing existing files.
 */
function prepareBuildDirectory(outDir: string): string {
  const outputPath = path.resolve(process.cwd(), outDir);

  if (fs.existsSync(outputPath))
    fs.rmSync(outputPath, { recursive: true, force: true });
  fs.mkdirSync(outputPath, { recursive: true });

  return outputPath;
}

/**
 * Generates environment-related files: Environment.ts and environment.ts.
 */
function makeEnvironments(config: ApiKitConfig, outputPath: string) {
  const { environments } = config;

  // Generate Environment.ts
  const environmentEnum = `
    export const Environment = {
      ${environments
        .map(
          (env) => `  ${env.name}: { 
          name: "${env.name}", 
          file: "${env.file}", 
          fileDir: "${env.fileDir || ''}" 
        }`,
        )
        .join(',\n')}
      } as const;

      export type EnvironmentType = keyof typeof Environment;
  `;

  fs.writeFileSync(path.join(outputPath, 'Environment.ts'), environmentEnum);

  // Generate environment.ts (runtime detection)
  const environmentFile = `
    import { Environment, EnvironmentType } from "./Environment";

    const currentEnv = (process.env.APP_ENV as EnvironmentType) || "development";

    export const environment = { 
      ...Environment[currentEnv], 
      filePath: \`\${process.cwd()}/\${Environment[currentEnv].file}\`
    };
  `;

  fs.writeFileSync(path.join(outputPath, 'environment.ts'), environmentFile);
}
