import path from 'node:path';

import { BUILDPLEASE_OUTPUT_DIRECTORY } from '@src-internal/buildplease-output';
import { loadEnvironmentConfig } from '@src-node/environment-configuration';
import { createDirectory, removePath } from '@src-node/file';
import { loadPackageJSON } from '@src-node/package-json';

import { generateBarrel, generateBuild, generateEnvironment, makeBuild } from './steps';

export async function generateBuildPlease(rootDir: string): Promise<string> {
  const pkg = loadPackageJSON(path.resolve(rootDir, 'package.json'));
  const loaded = await loadEnvironmentConfig({ dir: rootDir });
  const build = makeBuild(pkg);
  const outputPath = path.resolve(loaded.rootDir, BUILDPLEASE_OUTPUT_DIRECTORY);

  removePath(outputPath, { recursive: true, force: true });
  createDirectory(outputPath);

  generateBuild(build, outputPath);
  generateEnvironment(loaded.config.environments, outputPath);
  generateBarrel(outputPath);

  return outputPath;
}
