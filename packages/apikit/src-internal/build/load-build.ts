import fs from 'node:fs';
import path from 'node:path';

import type { Build } from '@buildplease/core';
import { ensureDirectory, resolvePath } from '@buildplease/core/node';
import { APIKIT_BUILD_MODULE, APIKIT_OUTPUT_DIRECTORY } from '@src-internal/generator/apikit-output';
import { createJiti } from 'jiti';

export interface LoadBuildOptions {
  readonly dir?: string;
}

export async function loadBuild(options: LoadBuildOptions = {}): Promise<Build> {
  const rootDir = resolveRootDir(options.dir);
  const filePath = path.resolve(rootDir, APIKIT_OUTPUT_DIRECTORY, `${APIKIT_BUILD_MODULE}.ts`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Prepared build "${filePath}" does not exist.`);
  }

  const jiti = createJiti(rootDir, {
    interopDefault: false,
  });
  let module: unknown;

  try {
    module = await jiti.import(filePath, { try: true });
  } catch {
    throw new Error('Prepared build is invalid.');
  }

  return readBuild(module);
}

function resolveRootDir(dir?: string): string {
  const rootDir = dir ? resolvePath(process.cwd(), dir) : process.cwd();
  ensureDirectory(rootDir);

  return rootDir;
}

function readBuild(input: unknown): Build {
  if (!isRecord(input) || !isRecord(input.Build)) {
    throw new Error('Prepared build is invalid.');
  }

  const build = input.Build;
  const name = build.name;

  if (
    !isRecord(name) ||
    !isNonEmptyString(name.original) ||
    !isNonEmptyString(name.base) ||
    !isNonEmptyString(build.version)
  ) {
    throw new Error('Prepared build is invalid.');
  }

  return {
    name: {
      original: name.original,
      base: name.base,
    },
    version: build.version,
  };
}

function isNonEmptyString(input: unknown): input is string {
  return typeof input === 'string' && Boolean(input.trim());
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null;
}
