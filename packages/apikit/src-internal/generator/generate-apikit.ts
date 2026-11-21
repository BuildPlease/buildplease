import path from 'node:path';

import { createDirectory, loadPackageJSON, removePath } from '@buildplease/core/node';

import { APIKIT_OUTPUT_DIRECTORY } from '../configuration/apikit-output';
import { loadEnvironmentConfig } from '../configuration/load-environment-config';
import { generateBarrel, generateBuild, generateEnvironment, makeBuild } from './steps';

export async function generateApiKit(rootDir: string): Promise<string> {
  const pkg = loadPackageJSON(path.resolve(rootDir, 'package.json'));
  const loaded = await loadEnvironmentConfig({ dir: rootDir });
  const build = makeBuild(pkg);
  const outputPath = path.resolve(loaded.rootDir, APIKIT_OUTPUT_DIRECTORY);

  removePath(outputPath, { recursive: true, force: true });
  createDirectory(outputPath);

  generateBuild(build, outputPath);
  generateEnvironment(loaded.config.environments, outputPath);
  generateBarrel(outputPath);

  return outputPath;
}
