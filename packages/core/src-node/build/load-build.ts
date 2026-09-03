import fs from 'node:fs';
import path from 'node:path';

import { BUILDPLEASE_BUILD_MODULE, BUILDPLEASE_OUTPUT_DIRECTORY } from '@internal/node/buildplease-output';
import type { Build } from '@neutral/build';
import { createJiti } from 'jiti';
import { validate as validateUUID } from 'uuid';

import { ensureDirectory, resolvePath } from '../file/file-sync';

export interface LoadBuildOptions {
  readonly dir?: string;
}

export async function loadBuild(options: LoadBuildOptions = {}): Promise<Build> {
  const rootDir = resolveRootDir(options.dir);
  const filePath = path.resolve(rootDir, BUILDPLEASE_OUTPUT_DIRECTORY, `${BUILDPLEASE_BUILD_MODULE}.ts`);

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
    !isNonEmptyString(build.version) ||
    !isNonEmptyString(build.id) ||
    !validateUUID(build.id) ||
    !isISODate(build.createdAt)
  ) {
    throw new Error('Prepared build is invalid.');
  }

  return {
    name: {
      original: name.original,
      base: name.base,
    },
    version: build.version,
    id: build.id,
    createdAt: build.createdAt,
  };
}

function isNonEmptyString(input: unknown): input is string {
  return typeof input === 'string' && Boolean(input.trim());
}

function isISODate(input: unknown): input is string {
  if (!isNonEmptyString(input)) return false;

  const date = new Date(input);

  return !Number.isNaN(date.getTime()) && date.toISOString() === input;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null;
}
