import fs from 'node:fs';
import path from 'node:path';

import { createJiti } from 'jiti';

import type { BuildMetadata } from '@/configuration/core/build-metadata';

const APP_BUILD_ENTRY = 'build-metadata.ts';

export async function loadAppBuild(rootDir: string, outDir: string): Promise<BuildMetadata> {
  const filePath = path.resolve(rootDir, outDir, APP_BUILD_ENTRY);

  if (!fs.existsSync(filePath)) {
    throw new Error(`ApiKit build metadata "${filePath}" does not exist. Run "apikit build:app" first.`);
  }

  const jiti = createJiti(rootDir, {
    interopDefault: false,
  });

  const module = await jiti.import(filePath, {
    try: true,
  });

  return readBuildMetadata(module, filePath);
}

function readBuildMetadata(input: unknown, filePath: string): BuildMetadata {
  if (!isRecord(input) || !isRecord(input.BuildMetadata)) {
    throw new Error(`ApiKit build metadata is missing (${filePath}).`);
  }

  const build = input.BuildMetadata;
  const name = build.name;

  if (
    !isRecord(name) ||
    typeof name.original !== 'string' ||
    typeof name.base !== 'string' ||
    typeof build.version !== 'string' ||
    typeof build.id !== 'string' ||
    typeof build.createdAt !== 'string'
  ) {
    throw new Error(`ApiKit build metadata is invalid (${filePath}).`);
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

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null;
}
